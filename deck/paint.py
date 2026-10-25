"""Procedural paint splatters and brush strokes (RGBA PNG) for the deck.
usage: python paint.py <outdir>
"""
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

PAINT = {
    "red": (230, 57, 70), "orange": (244, 118, 42), "yellow": (255, 196, 61),
    "teal": (31, 163, 154), "violet": (122, 63, 228), "pink": (255, 93, 162), "ink": (26, 26, 26),
}


def finish(mask, color, seed, crisp=True):
    m = mask.filter(ImageFilter.GaussianBlur(2.2))
    a = np.asarray(m).astype(np.float32)
    if crisp:
        a = np.clip((a - 110) * 4, 0, 255)
    rng = np.random.default_rng(seed)
    h, w = a.shape
    # low-frequency shade so the paint is not flat
    small = rng.normal(0, 1, (max(2, h // 120), max(2, w // 120))).astype(np.float32)
    shade = np.asarray(Image.fromarray(((small - small.min()) / (np.ptp(small) + 1e-6) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255
    rgb = np.zeros((h, w, 3), np.float32)
    for i, c in enumerate(color):
        rgb[..., i] = np.clip(c * (0.9 + 0.16 * shade), 0, 255)
    img = np.dstack([rgb, a]).astype(np.uint8)
    im = Image.fromarray(img, "RGBA")
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def splat(seed, color, S=1400, spikes=14, drops=26, drip=True):
    rng = np.random.default_rng(seed)
    m = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(m)
    cx, cy, R = S * 0.5, S * 0.47, S * 0.17
    th = np.linspace(0, 2 * np.pi, 720, endpoint=False)
    r = np.ones_like(th)
    for k in range(2, 9):
        r += rng.uniform(0.02, 0.09) / (k ** 0.4) * np.sin(k * th + rng.uniform(0, 6.3))
    pts = [(cx + R * rr * math.cos(t), cy + R * rr * math.sin(t)) for t, rr in zip(th, r)]
    d.polygon(pts, fill=255)
    for _ in range(spikes):  # tapered spikes with a bead at the tip
        t = rng.uniform(0, 2 * np.pi)
        L = R * rng.uniform(1.15, 1.95)
        wbase = R * rng.uniform(0.08, 0.2)
        p = lambda rad, off: (cx + rad * math.cos(t) - off * math.sin(t), cy + rad * math.sin(t) + off * math.cos(t))
        d.polygon([p(R * 0.6, -wbase), p(L, 0), p(R * 0.6, wbase)], fill=255)
        br = wbase * rng.uniform(0.35, 0.8)
        tx, ty = p(L, 0)
        d.ellipse([tx - br, ty - br, tx + br, ty + br], fill=255)
    for _ in range(drops):  # loose droplets, smaller further out
        t = rng.uniform(0, 2 * np.pi)
        dist = R * rng.uniform(1.25, 2.6)
        rr = R * 0.16 * (1.6 - dist / (R * 2.6)) * rng.uniform(0.3, 1.0)
        x, y = cx + dist * math.cos(t), cy + dist * math.sin(t)
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=255)
    if drip:
        for _ in range(rng.integers(2, 4)):
            x = cx + rng.uniform(-0.6, 0.6) * R
            w = R * rng.uniform(0.07, 0.13)
            L = R * rng.uniform(0.9, 1.9)
            d.rounded_rectangle([x - w, cy, x + w, cy + R * 0.6 + L], radius=w, fill=255)
            d.ellipse([x - w * 1.5, cy + R * 0.6 + L - w * 1.2, x + w * 1.5, cy + R * 0.6 + L + w * 1.8], fill=255)
    return finish(m, color, seed)


def stroke(seed, color, W=2000, H=260):
    rng = np.random.default_rng(seed)
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    n = 70
    for i in range(n):  # bristles
        y0 = H * 0.18 + (H * 0.64) * i / n + rng.normal(0, 2)
        start = rng.uniform(0, W * 0.06)
        end = W - rng.uniform(0, W * 0.22) * (rng.random() ** 2)
        wob = rng.uniform(3, 9)
        ph = rng.uniform(0, 6.3)
        xs = np.linspace(start, end, 60)
        ys = y0 + wob * np.sin(xs / W * 6 + ph) + (xs / W) * rng.normal(0, 6)
        width = int(max(2, rng.normal(H / n * 2.2, 1.2)))
        seg = list(zip(xs, ys))
        # dry-brush gaps near the tail
        k = 0
        while k < len(seg) - 1:
            if xs[k] > W * 0.7 and rng.random() < 0.12:
                k += rng.integers(1, 4)
                continue
            d.line([seg[k], seg[k + 1]], fill=255, width=width)
            k += 1
    # rounded loaded head
    d.ellipse([W * 0.0, H * 0.16, W * 0.07, H * 0.84], fill=255)
    return finish(m, color, seed, crisp=False)


combos = [
    ("splat_red", "red", 3), ("splat_orange", "orange", 11), ("splat_yellow", "yellow", 21),
    ("splat_teal", "teal", 31), ("splat_violet", "violet", 41), ("splat_pink", "pink", 51),
    ("splat_red_b", "red", 61), ("splat_teal_b", "teal", 71),
]
for name, c, s in combos:
    splat(s, PAINT[c]).save(f"{OUT}/{name}.png")
for name, c, s in [("stroke_yellow", "yellow", 5), ("stroke_teal", "teal", 15), ("stroke_pink", "pink", 25), ("stroke_orange", "orange", 35), ("stroke_violet", "violet", 45), ("stroke_red", "red", 55)]:
    stroke(s, PAINT[c]).save(f"{OUT}/{name}.png")

# preview sheet
files = sorted(f for f in os.listdir(OUT) if f.endswith(".png") and not f.startswith("_"))
sheet = Image.new("RGBA", (1800, 1000), (255, 255, 255, 255))
x = y = 0
for f in files:
    im = Image.open(f"{OUT}/{f}")
    im.thumbnail((300, 240))
    sheet.alpha_composite(im, (x, y))
    x += 300
    if x >= 1800:
        x, y = 0, y + 250
sheet.convert("RGB").save(f"{OUT}/_preview.png")
print(files)
