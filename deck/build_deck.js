// 다음무대 발표자료 생성기. 표지·마지막은 어두운 배경, 본문은 흰 바탕, 단계마다 물감 색 하나.
//   python paint.py paint          # 물감·붓 자국 이미지 생성
//   PHOTO_DIR=<사진 폴더> STUDENT_ID=<학번> node build_deck.js out.pptx
// 현장 사진은 개인정보(얼굴) 때문에 저장소에 넣지 않았다. 사진이 없으면 그 자리에 빈 틀이 들어간다.
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Pi = require("react-icons/pi");
const JSZip = require("jszip");
const QRCode = require("qrcode");

const OUT = process.argv[2] || path.join(__dirname, "다음무대_발표자료.pptx");
const DATA = path.join(__dirname, "..", "analysis", "results");
const PAINT = path.join(__dirname, "paint");
const PHOTO = (process.env.PHOTO_DIR || path.join(__dirname, "photos")) + "/";
const PROTO = path.join(__dirname, "..", "prototype", "screenshots") + "/";
const PROTO_URL = "https://next-stage-seongsu.vercel.app";
const lp = JSON.parse(fs.readFileSync(path.join(DATA, "chart_lp.json"), "utf8"));
const FONT = "Malgun Gothic";

const K = { ink: "1A1A1A", sub: "5A5A5A", line: "E2E2DF", card: "F4F4F2", gray: "B8B8B8", night: "161618", nightSub: "B2B2AE", white: "FFFFFF" };
const PAINTS = { red: "E63946", orange: "F4762A", yellow: "FFC43D", teal: "1FA39A", violet: "7A3FE4", pink: "FF5DA2" };
// one paint per step; text = darker shade that passes 4.5:1 on white, tint = light background
const STEP = {
  field: { label: "STEP 1 · 현장 조사", paint: "red", c: PAINTS.red, text: "C1272F", tint: "FDECEE" },
  problem: { label: "STEP 1 · 문제 정의", paint: "orange", c: PAINTS.orange, text: "B9530F", tint: "FEF0E6" },
  data: { label: "STEP 2 · 데이터 분석", paint: "teal", c: PAINTS.teal, text: "137A72", tint: "E4F5F3" },
  solution: { label: "STEP 3 · 솔루션 설계", paint: "violet", c: PAINTS.violet, text: "5B2BB5", tint: "F0EAFD" },
  proto: { label: "STEP 4 · 프로토타입", paint: "pink", c: PAINTS.pink, text: "C2346F", tint: "FFEBF3" },
  impact: { label: "STEP 5 · 실행 가능성과 기대효과", paint: "yellow", c: PAINTS.yellow, text: "8A5A00", tint: "FFF6DD" },
};
const THEME = {
  name: "다음무대 물감", headFontFace: FONT, bodyFontFace: FONT,
  colors: { dk1: K.ink, lt1: K.white, dk2: K.sub, lt2: K.card, accent1: PAINTS.red, accent2: PAINTS.orange, accent3: PAINTS.teal, accent4: PAINTS.violet, accent5: PAINTS.pink, accent6: PAINTS.yellow, hlink: STEP.solution.text, folHlink: K.sub },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = "4일 쓰고 버려지는 무대";
pres.author = "김민우";
pres.subject = "2026 크리에이티브X성수 Pain Point 해결 개인과제";

pres.defineSlideMaster({
  title: "COVER", background: { color: K.night },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 2.2, w: 6.4, h: 2.0, fontSize: 52, bold: true, color: K.white, align: "left", valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 4.45, w: 6.2, h: 0.9, fontSize: 18, color: K.white, align: "left", valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT", background: { color: K.white },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.78, w: 11.0, h: 0.75, fontSize: 30, bold: true, color: K.ink, align: "left", valign: "top", margin: 0 }, text: "" } },
    { text: { text: "김민우 · 2026 크리에이티브X성수 개인과제", options: { x: 0.6, y: 7.02, w: 8, h: 0.3, fontSize: 10, color: K.sub, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.02, w: 0.5, h: 0.3, fontSize: 10, color: K.sub, align: "right" },
});
pres.defineSlideMaster({
  title: "CLOSING", background: { color: K.night },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.78, w: 11.0, h: 0.75, fontSize: 30, bold: true, color: K.white, align: "left", valign: "top", margin: 0 }, text: "" } },
    { text: { text: "김민우 · 2026 크리에이티브X성수 개인과제", options: { x: 0.6, y: 7.02, w: 8, h: 0.3, fontSize: 10, color: K.nightSub, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.02, w: 0.5, h: 0.3, fontSize: 10, color: K.nightSub, align: "right" },
});

// ---------- helpers ----------
const aspect = {};
async function loadAspects() {
  for (const f of fs.readdirSync(PAINT)) {
    if (!/^(splat|stroke)_.*\.png$/.test(f)) continue;
    const m = await sharp(path.join(PAINT, f)).metadata();
    aspect[f.replace(".png", "")] = m.height / m.width;
  }
}
function paint(s, name, x, y, w, rotate = 0) {
  s.addImage({ path: path.join(PAINT, name + ".png"), x, y, w, h: w * aspect[name], rotate, objectName: name, altText: "" });
}
function brush(s, color, x, y, w, h, transparency = 0) {
  s.addImage({ path: path.join(PAINT, `stroke_${color}.png`), x, y, w, h, transparency, objectName: `brush-${color}`, altText: "" });
}
function photo(s, o) {
  if (fs.existsSync(o.path)) return s.addImage(o);
  s.addText("사진", { shape: pres.ShapeType.rect, x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: K.card }, line: { color: "CFCFCB", width: 1, dashType: "dash" }, fontSize: 12, color: K.sub, align: "center", valign: "middle", isTextBox: true, objectName: o.objectName });
}
async function applyTheme(file, theme) {
  // pptxgenjs는 테마 색을 쓰지 못해서, 저장한 뒤 theme1.xml의 색 구성표를 바꾼다
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const part = "ppt/theme/theme1.xml";
  const slots = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];
  const scheme = `<a:clrScheme name="${theme.name}">` + slots.map((k) => `<a:${k}><a:srgbClr val="${theme.colors[k]}"/></a:${k}>`).join("") + "</a:clrScheme>";
  zip.file(part, (await zip.file(part).async("string")).replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, scheme));
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer" }));
}
function T(s, text, o) { s.addText(text, { margin: 0, isTextBox: true, ...o }); }
function content(title, st, section) {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section });
  s.addText(title, { placeholder: "title" });
  if (st) {
    paint(s, `splat_${st.paint}`, 0.5, 0.26, 0.42);
    T(s, st.label, { x: 1.02, y: 0.3, w: 6, h: 0.32, fontSize: 13, bold: true, color: K.ink, objectName: "step-label" });
    paint(s, `splat_${st.paint}`, 11.75, -0.55, 2.1, 18);
  }
  return s;
}
function source(s, text, y = 6.62, color = K.sub) {
  T(s, text, { x: 0.6, y, w: 12.1, h: 0.32, fontSize: 10, color, objectName: "source" });
}
function photoSlot(s, x, y, w, h, label, name, st) {
  s.addText(label, { shape: pres.ShapeType.rect, x, y, w, h, fill: { color: st.tint }, line: { color: st.c, width: 1.25, dashType: "dash" }, color: K.sub, fontSize: 14, align: "center", valign: "middle", isTextBox: true, objectName: name });
}
function chartText(dark = false) {
  const t = dark ? K.white : K.ink, sub = dark ? K.nightSub : K.sub;
  return {
    catAxisLabelColor: sub, valAxisLabelColor: sub, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
    catAxisLabelFontSize: 12, valAxisLabelFontSize: 11, dataLabelFontFace: "+mn-lt", dataLabelFontSize: 12, dataLabelColor: t,
    legendFontFace: "+mn-lt", legendFontSize: 12, legendColor: sub, titleFontFace: "+mn-lt", titleColor: t, titleFontSize: 14,
    valGridLine: { color: K.line, size: 0.75 }, catGridLine: { style: "none" }, catAxisLineShow: false, valAxisLineShow: false,
  };
}
async function icon(name, hex, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Pi[name], { color: "#" + hex, size: String(size) }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

(async () => {
  await QRCode.toFile(path.join(PAINT, "qr_proto.png"), PROTO_URL, { width: 600, margin: 1, color: { dark: "#1A1A1AFF", light: "#FFFFFFFF" } });
  await loadAspects();
  const ic = {
    warn: await icon("PiWarningCircleBold", K.white), chart: await icon("PiChartBarBold", K.white),
    cycle: await icon("PiRecycleBold", K.white), plant: await icon("PiPlantBold", K.ink),
    camera: await icon("PiCameraBold", K.white), link: await icon("PiLinkBold", K.white), paintb: await icon("PiPaintBrushBold", K.white),
    arrow: await icon("PiArrowRightBold", "9A9A9A"),
    store: await icon("PiStorefrontBold", K.ink), box: await icon("PiPackageBold", K.ink), brushI: await icon("PiPaintBrushBold", K.ink), frame: await icon("PiFrameCornersBold", K.ink),
  };

  // 1 cover ------------------------------------------------------------
  {
    pres.addSection({ title: "표지" });
    const s = pres.addSlide({ masterName: "COVER", sectionTitle: "표지" });
    // cover photo removed by the student (2026-10-25): plain dark background reads cleaner
    paint(s, "splat_red", 8.2, 0.3, 4.2, -10);
    paint(s, "splat_yellow", 10.8, 4.4, 2.4, 14);
    paint(s, "splat_teal", 7.0, 4.8, 1.9, 0);
    paint(s, "splat_violet", 5.6, 1.0, 0.9, 0);
    paint(s, "splat_pink", 12.1, 3.2, 1.0, 20);
    brush(s, "red", 0.45, 3.28, 5.5, 0.82);
    s.addText("4일 쓰고\n버려지는 무대", { placeholder: "title" });
    s.addText("성수 팝업·축제 설치물을 다음 무대로 잇는\nAI 순환 서비스, 다음무대", { placeholder: "body" });
    T(s, "2026 크리에이티브X성수 Pain Point 해결", { x: 0.7, y: 1.55, w: 6, h: 0.4, fontSize: 14, bold: true, color: PAINTS.yellow });
    T(s, "기업연계 AI캡스톤디자인 개인과제 · 김민우" + (process.env.STUDENT_ID ? ` (${process.env.STUDENT_ID})` : ""), { x: 0.7, y: 6.55, w: 6.5, h: 0.35, fontSize: 12, color: K.nightSub, objectName: "author" });
    s.addNotes("주제전시는 4일 동안 열렸다. 그 4일을 위해 지은 구조물이 어디로 가는지에서 출발한 과제다.");
  }

  // 2 summary ----------------------------------------------------------
  {
    pres.addSection({ title: "요약" });
    const s = content("한 장 요약", null, "요약");
    const cols = [
      ["문제", ic.warn, STEP.problem, "주제전시는 4일 열리고 철거됐다. 성수 팝업은 평균 17.9일마다 같은 일을 반복한다."],
      ["근거", ic.chart, STEP.data, "서울 팝업의 35%가 성동구에서 열린다. 그런데 점포 통계에는 팝업이 잡히지 않는다."],
      ["해법", ic.cycle, STEP.solution, "철거 전 사진 한 장으로 AI가 자재를 목록화하고 다음 팝업과 작가에게 잇는다."],
      ["효과", ic.plant, STEP.impact, "연 500톤 중 20~40%를 다시 쓰면 100~200톤이 줄어든다. 팝업 폐기물이 처음으로 기록된다."],
    ];
    cols.forEach(([h, img, st, body], i) => {
      const x = 0.6 + i * 3.075;
      paint(s, `splat_${st.paint}`, x - 0.15, 1.65, 1.35);
      s.addImage({ data: img, x: x + 0.27, y: 2.15, w: 0.5, h: 0.5, objectName: `sum-icon-${i}` });
      T(s, h, { x, y: 3.15, w: 2.6, h: 0.5, fontSize: 22, bold: true, color: st.text });
      T(s, body, { x, y: 3.75, w: 2.6, h: 2.5, fontSize: 15, color: K.ink, valign: "top", lineSpacingMultiple: 1.15 });
      if (i < 3) s.addImage({ data: ic.arrow, x: x + 2.75, y: 3.3, w: 0.22, h: 0.22, objectName: `sum-arrow-${i}` });
    });
    s.addNotes("문제, 근거, 해법, 효과를 한 장으로 먼저 보여준다.");
  }

  // 3 field photos -----------------------------------------------------
  {
    pres.addSection({ title: "현장 조사" });
    const st = STEP.field;
    const s = content("주제전시 & 퍼포먼스 참여 현장", st, "현장 조사");
    const y = 1.75, h = 3.5;
    photo(s, { path: PHOTO + "슬라이드_사진1_단체.jpg", x: 0.6, y, w: 2.625, h, objectName: "photo-1", altText: "주제전시 입구 소개 벽 앞 단체 사진, 동행인 얼굴은 흐리게 처리" });
    photo(s, { path: PHOTO + "슬라이드_사진2_입구.jpg", x: 3.425, y, w: 4.667, h, objectName: "photo-2", altText: "에스팩토리 주제전시 입구 앞 본인 사진" });
    T(s, "사진 1", { x: 0.6, y: y + h + 0.12, w: 2.625, h: 0.3, fontSize: 12, bold: true, color: st.text });
    T(s, "사진 2", { x: 3.425, y: y + h + 0.12, w: 4.667, h: 0.3, fontSize: 12, bold: true, color: st.text });
    T(s, "촬영 일시  2026.10.08(목)\n장소  에스팩토리 D동 (서울 성동구 연무장15길 11)\n프로그램  2026 크리에이티브X성수 주제전시(CT Fair)", { x: 0.6, y: y + h + 0.45, w: 7.5, h: 0.85, fontSize: 12, color: K.sub, valign: "top", objectName: "photo-meta" });
    const px = 8.45;
    photo(s, { path: PHOTO + "슬라이드_플레이_QR.jpg", x: px, y, w: 1.969, h, objectName: "photo-play-qr", altText: "플레이성수 컬러 어드벤처 현장 구매 QR 배너" });
    photo(s, { path: PHOTO + "슬라이드_플레이_구매.jpg", x: px + 2.15, y, w: 1.969, h, objectName: "photo-play-buy", altText: "플레이성수 구매 화면" });
    T(s, "함께 참여한 프로그램", { x: px, y: y + h + 0.12, w: 4.25, h: 0.3, fontSize: 12, bold: true, color: st.text });
    T(s, "플레이성수 '컬러 어드벤처' (성수동 전역)\n골목의 현장 구매 QR 배너와 구매 화면", { x: px, y: y + h + 0.45, w: 4.25, h: 0.85, fontSize: 12, color: K.sub, valign: "top", objectName: "play-meta" });
    s.addNotes("개막일인 10월 8일에 에스팩토리 주제전시를 관람했고, 골목에서 플레이성수 QR 배너를 보고 참여했다. 동행인 얼굴은 흐리게 처리했다.");
  }

  // 4 observation ------------------------------------------------------
  {
    const st = STEP.field;
    const s = content("관찰 기록: 작품보다 구조물이 먼저 보였다", st, "현장 조사");
    const steps = [
      ["도착", "성수역 3번 출구 → 연무장길", "팝업 매장과 플레이성수 QR 배너 사이를 지나 에스팩토리로 이동"],
      ["입장", "주제전시 관람", "건물을 덮은 대형 현수막, 가벽과 곡면 구조물, 비계 파이프 프레임이 전시를 이루고 있었다"],
      ["관람 중", "떠오른 질문", "이 전시는 10월 11일까지 4일. 끝나면 이 구조물은 어디로 가나?"],
      ["이후", "확인한 것", "전시 종료 뒤 설치물 철거. 에스팩토리는 연중 팝업과 행사가 바뀌는 공간이다"],
    ];
    steps.forEach(([t, h, b], i) => {
      const y = 1.8 + i * 1.18;
      const hot = i === 2;
      s.addShape(pres.ShapeType.ellipse, { x: 0.62, y: y + 0.08, w: 0.26, h: 0.26, fill: { color: hot ? st.c : "CFCFCB" }, line: { color: hot ? st.c : "CFCFCB" }, objectName: `obs-dot-${i}` });
      if (i < 3) s.addShape(pres.ShapeType.line, { x: 0.75, y: y + 0.36, w: 0, h: 0.9, line: { color: "CFCFCB", width: 1.5 }, objectName: `obs-line-${i}` });
      T(s, t, { x: 1.1, y, w: 1.2, h: 0.4, fontSize: 14, bold: true, color: hot ? st.text : K.sub });
      T(s, h, { x: 2.3, y, w: 4.9, h: 0.4, fontSize: 16, bold: true, color: K.ink });
      T(s, b, { x: 2.3, y: y + 0.4, w: 4.9, h: 0.7, fontSize: 14, color: K.ink, valign: "top" });
    });
    photo(s, { path: PHOTO + "슬라이드_휴먼레지듀.jpg", x: 9.0, y: 1.75, w: 3.7, h: 4.933, objectName: "photo-human-residue", altText: "주제전시 휴먼 레지듀 설치 현장, 비계 파이프 구조물과 작업대" });
    T(s, "주제전시 3번 '휴먼 레지듀' 설치 현장\n비계 파이프 프레임, 작업대, 가죽 자재\n(직접 촬영)", { x: 7.35, y: 5.2, w: 1.5, h: 1.45, fontSize: 11, color: K.sub, valign: "bottom", objectName: "hr-caption" });
    s.addNotes("관람하며 가장 먼저 든 생각은 이 구조물이 4일 뒤 어디로 가느냐였다.");
  }

  // 5 what remains -----------------------------------------------------
  {
    const st = STEP.field;
    const s = content("4일 뒤, 이 현수막과 구조물은 어디로 가나", st, "현장 조사");
    const pics = [
      ["슬라이드_남는것_1.jpg", "직접 촬영", "주제전시 건물을 덮은 대형 현수막 '창조적 변용'"],
      ["슬라이드_남는것_2.jpg", "공식 책자", "가벽과 곡면 구조물로 나눈 에스팩토리 D동 전시장"],
      ["슬라이드_남는것_3.jpg", "뉴스1", "연무장길 팝업 매장 공사 현장 (2024.9.6)"],
      ["슬라이드_남는것_4.jpg", "뉴스1", "골목에 쌓인 폐기물 봉투, 대부분 소각 예정 (2024.9.6)"],
    ];
    pics.forEach(([f, src, cap], i) => {
      const x = 0.6 + i * 3.083;
      photo(s, { path: PHOTO + f, x, y: 1.85, w: 2.85, h: 2.1375, objectName: `remain-${i}`, altText: cap });
      brush(s, "red", x - 0.05, 1.72, 1.35, 0.4);
      T(s, src, { x: x + 0.1, y: 1.74, w: 1.2, h: 0.36, fontSize: 11, bold: true, color: K.white, valign: "middle" });
      T(s, cap, { x, y: 4.1, w: 2.85, h: 0.75, fontSize: 13, color: K.ink, valign: "top" });
    });
    paint(s, "splat_red", 0.45, 5.25, 0.55);
    T(s, "전시는 4일, 성수 팝업은 평균 17.9일마다 바뀐다.", { x: 1.15, y: 5.2, w: 11.5, h: 0.5, fontSize: 22, bold: true, color: K.ink });
    T(s, "그때마다 자재가 골목으로 나오지만, 무엇이 얼마나 나오는지 기록하는 곳은 없다.", { x: 1.15, y: 5.75, w: 11.5, h: 0.45, fontSize: 16, color: K.sub });
    source(s, "사진: 직접 촬영(2026.10.8), 2026 크리에이티브X성수 공식 책자, 뉴스1 임여익 기자(2024.9.6) 「쓰레기 쏟아내는 '성수동 팝업'」");
    s.addNotes("앞의 두 장은 내가 본 축제 설치물, 뒤의 두 장은 같은 골목에서 반복되는 팝업 공사와 폐기물이다.");
  }

  // 6 problem ----------------------------------------------------------
  {
    pres.addSection({ title: "문제 정의" });
    const st = STEP.problem;
    const s = content("축제가 끝나면 무대는 폐기물이 된다", st, "문제 정의");
    s.addShape(pres.ShapeType.rect, { x: 0.6, y: 1.8, w: 5.6, h: 4.5, fill: { color: K.night }, line: { color: K.night }, objectName: "problem-card" });
    T(s, [
      { text: "며칠을 위해 짓고,\n끝나면 부숴서 버린다.", options: { fontSize: 24, bold: true, color: K.white, breakLine: true } },
      { text: " ", options: { fontSize: 10, breakLine: true } },
      { text: "가벽, 합판, 아크릴, 출력물은 한 번 쓰고 대부분 소각된다. 다시 쓸 자재도 가져갈 사람을 모르고, 철거 기한이 짧아 분류할 시간이 없다.", options: { fontSize: 15, color: "D9D9D6" } },
    ], { x: 0.9, y: 2.05, w: 5.0, h: 2.3, valign: "top", objectName: "problem-text" });
    [["약 3톤", "팝업 1곳 폐기물"], ["17.9일", "팝업 운영 기간"], ["권고뿐", "구청 팝업 매뉴얼"]].forEach(([n, d], i) => {
      const x = 0.9 + i * 1.72;
      T(s, n, { x, y: 4.6, w: 1.65, h: 0.6, fontSize: 24, bold: true, color: st.c });
      T(s, d, { x, y: 5.2, w: 1.6, h: 0.8, fontSize: 12, color: "D9D9D6", valign: "top" });
    });
    s.addChart(pres.ChartType.bar, [{ name: "배출량(톤)", labels: ["2018", "2020", "2022"], values: [51.2, 220.1, 518.6] }], {
      x: 6.5, y: 1.8, w: 6.2, h: 4.5, barDir: "col", chartColors: [st.c], barGapWidthPct: 80,
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"톤"', valAxisHidden: true,
      showTitle: true, title: "성동구 폐기물 배출량, 4년 사이 10배", ...chartText(), valGridLine: { style: "none" }, objectName: "chart-waste",
    });
    source(s, "출처: 서울 열린데이터광장 수치를 인용한 뉴스1(2024.9.8), 쿠키뉴스(팝업 1곳 약 3톤), 스위트스팟 팝업 트렌드 리포트(17.9일), 성동구 팝업 운영 매뉴얼", 6.45);
    s.addNotes("왜 중요한가: 양이 많고, 주기가 빨라지고, 아무도 세지 않는다. 축제 주제는 '창조적 변용'인데 설치물은 변용되지 않고 버려진다.");
  }

  // 7 data 1 -----------------------------------------------------------
  {
    pres.addSection({ title: "데이터 분석" });
    const st = STEP.data;
    const s = content("서울 팝업 3곳 중 1곳이 성동구, 3주도 안 돼 철거", { ...st, label: st.label + " ①" }, "데이터 분석");
    s.addChart(pres.ChartType.bar, [{ name: "평균 운영 기간(일)", labels: ["2024 상반기", "2025 상반기"], values: [25.1, 17.9] }], {
      x: 0.6, y: 1.75, w: 5.9, h: 4.5, barDir: "col", chartColors: [K.gray, st.c], barGapWidthPct: 70,
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"일"', valAxisHidden: true,
      showTitle: true, title: "팝업 평균 운영 기간", ...chartText(), valGridLine: { style: "none" }, objectName: "chart-duration",
    });
    s.addChart(pres.ChartType.doughnut, [{ name: "2025 서울 팝업 지역 비중", labels: ["성동구", "그 외 서울"], values: [35.4, 64.6] }], {
      x: 6.8, y: 1.75, w: 5.9, h: 4.5, chartColors: [st.c, "DCDCD8"], holeSize: 62, showPercent: true, showValue: false,
      showLegend: true, legendPos: "b", showTitle: true, title: "2025년 서울 팝업 3,077건 중 지역 비중", ...chartText(), dataLabelColor: K.ink, objectName: "chart-share",
    });
    source(s, "출처: 스위트스팟(팝가) 2025 팝업스토어 트렌드 리포트(1~11월 3,077건, 상반기 1,488건), 위픽레터·바이라인네트워크 보도 재인용");
    s.addNotes("민간 집계지만 팝업 수와 운영 기간을 함께 보여주는 자료가 이것뿐이다.");
  }

  // 8 data 2 -----------------------------------------------------------
  {
    const st = STEP.data;
    const s = content("그런데 공식 점포 통계에는 팝업이 보이지 않는다", { ...st, label: st.label + " ②" }, "데이터 분석");
    const yrs = ["2021", "2022", "2023", "2024", "2025"];
    s.addChart(pres.ChartType.bar, [
      { name: "서울 전체", labels: yrs, values: [24.8, 23.4, 25.9, 22.6, 20.1] },
      { name: "성수 4개 동", labels: yrs, values: [24.8, 23.0, 25.1, 22.5, 21.5] },
    ], {
      x: 0.6, y: 1.85, w: 7.5, h: 4.55, barDir: "col", chartColors: [K.gray, st.c], barGapWidthPct: 60, barOverlapPct: 0,
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"%"', dataLabelFontSize: 11, valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 32,
      showLegend: true, legendPos: "b", showTitle: true, title: "등록 점포 교체율 (연간 개업+폐업 ÷ 점포 수)", ...chartText(), valGridLine: { style: "none" }, dataLabelFontSize: 11, objectName: "chart-turnover",
    });
    brush(s, "yellow", 8.55, 2.15, 3.2, 0.9);
    T(s, "21.5%", { x: 8.75, y: 1.95, w: 3.8, h: 1.2, fontSize: 60, bold: true, color: K.ink });
    T(s, "2025년 성수 4개 동 등록 점포 교체율", { x: 8.75, y: 3.15, w: 4.0, h: 0.4, fontSize: 14, color: K.sub });
    T(s, [{ text: "서울 평균 ", options: { color: K.sub } }, { text: "20.1%", options: { bold: true, color: K.ink } }], { x: 8.75, y: 3.65, w: 4.0, h: 0.5, fontSize: 22 });
    T(s, [
      { text: "통계로 보면 성수 점포는 서울과 비슷하게 1년에 5곳 중 1곳꼴로 바뀐다. ", options: { color: K.ink } },
      { text: "평균 17.9일마다 바뀌는 팝업은 성동구에서만 한 해 1,000곳 넘게 열리지만 이 통계에 없고, 철거되는 양도 따로 세지 않는다.", options: { bold: true, color: K.ink } },
    ], { x: 8.75, y: 4.4, w: 3.95, h: 2.0, fontSize: 15, valign: "top", objectName: "insight-text" });
    source(s, "출처: 서울신용보증재단, 서울시 상권분석서비스(점포-행정동) OA-22172, 2021년 1분기~2025년 4분기 · 성수1가1·1가2·2가1·2가3동 합계");
    s.addNotes("등록 점포만 세면 성수는 오히려 안정적이다. 팝업은 그 바깥에서 돌고 있다.");
  }

  // 9 data 3 -----------------------------------------------------------
  {
    const st = STEP.data;
    const s = content("축제 주말 오후, 성수동에 1만 3천 명이 더 있었다", { ...st, label: st.label + " ③" }, "데이터 분석");
    const hrs = lp.hours.map((h) => `${h}시`);
    s.addChart(pres.ChartType.line, [
      { name: "평소 주말 (8.23~9.28 중 5주)", labels: hrs, values: lp.base.map((v) => +(v / 10000).toFixed(1)) },
      { name: "2025 축제 주말 (9.20~21)", labels: hrs, values: lp.fest.map((v) => +(v / 10000).toFixed(1)) },
    ], {
      x: 0.6, y: 1.85, w: 8.0, h: 4.55, chartColors: [K.gray, st.c], lineSize: 3.5, lineDataSymbol: "none",
      valAxisMinVal: 6, valAxisMaxVal: 13, valAxisLabelFormatCode: '0"만"', catAxisLabelFrequency: 3,
      showLegend: true, legendPos: "b", showTitle: true, title: "성수 4개 동 시간대별 생활인구 (주말 평균)", ...chartText(), objectName: "chart-lp",
    });
    brush(s, "yellow", 9.05, 2.15, 2.7, 0.9);
    T(s, "+11%", { x: 9.25, y: 1.95, w: 3.4, h: 1.2, fontSize: 64, bold: true, color: K.ink });
    T(s, "축제 주말 13~18시 평균, 16시엔 +1.3만 명", { x: 9.25, y: 3.15, w: 3.5, h: 0.7, fontSize: 14, color: K.sub, valign: "top" });
    T(s, "평일은 평소와 거의 같았다(차이 1% 이내). 사람은 주말 오후에 몰리고, 설치물도 그 며칠을 위해 지어졌다가 한꺼번에 철거된다.", { x: 9.25, y: 4.0, w: 3.45, h: 2.3, fontSize: 15, color: K.ink, valign: "top", objectName: "lp-text" });
    source(s, "출처: 서울특별시, 행정동 단위 서울 생활인구(내국인) OA-14991, 2025.8.23~9.28 주말 · 성수 4개 동 합계, 축제 주말과 평소 주말 5주의 시간대별 평균 비교");
    s.addNotes("2026년 생활인구는 아직 공개 전이라 같은 축제의 2025년 기간으로 비교했다.");
  }

  // 10 method ----------------------------------------------------------
  {
    const st = STEP.data;
    const s = content("분석 절차: 누가 다시 돌려도 같은 숫자가 나오도록", { ...st, label: "STEP 2 · 분석 절차" }, "데이터 분석");
    const head = ["데이터 (기관·데이터셋)", "기간", "처리", "결과"].map((t) => ({ text: t, options: { bold: true, color: K.white, fill: { color: K.ink } } }));
    const rows = [
      ["상권분석서비스(점포-행정동)\n서울신용보증재단 · OA-22172", "2021Q1~\n2025Q4", "성수 4개 동 코드(11200650·660·670·690) 추출 → 분기 점포 수 평균, 개업·폐업 점포 수 연 합계 → 교체율 계산", "성수 21.5%\n서울 20.1%\n(2025)"],
      ["행정동 생활인구(내국인)\n서울특별시 · OA-14991", "2025.8.23~\n9.28 주말", "성수 4개 동 시간대별 합계 → 축제 주말(9.20~21)과 평소 주말 5주 평균 비교", "13~18시\n+11.0%"],
      ["팝업스토어 트렌드 리포트\n스위트스팟(팝가)", "2024~2025", "보도된 집계 인용 (운영 기간, 지역 비중)", "17.9일\n35.4%"],
      ["성동구 폐기물 배출량\n서울 열린데이터광장", "2018~2022", "보도 수치 인용, 원자료 재현 예정", "51.2→518.6톤"],
    ];
    s.addTable([head, ...rows.map((r) => r.map((t, j) => ({ text: t, options: j === 3 ? { bold: true, color: st.text } : {} })))], {
      x: 0.6, y: 1.75, w: 12.1, colW: [3.5, 1.5, 5.2, 1.9], fontSize: 13, color: K.ink, valign: "middle",
      border: { type: "solid", pt: 0.75, color: K.line }, fill: { color: K.white }, rowH: [0.45, 1.0, 0.9, 0.75, 0.75], margin: 0.08, objectName: "method-table",
    });
    source(s, "분석 도구: Python 3.13, pandas · 분석 코드와 중간 결과: github.com/minwoooo330/next-stage-seongsu (analysis 폴더, 스크립트 3개로 같은 숫자 재현)", 6.45);
    s.addNotes("평가 항목 '재현 가능성'을 위해 데이터셋 번호, 기간, 필터, 계산식을 모두 적었다.");
  }

  // 11 causes -> modules -----------------------------------------------
  {
    pres.addSection({ title: "솔루션 설계" });
    const st = STEP.solution;
    const s = content("왜 버려지나: 원인 네 가지와 대응", st, "솔루션 설계");
    const pairs = [
      ["다음 입점 전까지 철거 기한이 짧다", "사진만 찍으면 AI가 자재 목록을 만든다"],
      ["브랜드 맞춤 제작이라 그대로는 다른 곳에 안 맞는다", "자재 단위로 쪼개 매칭하고, 남는 건 작가가 바꾼다"],
      ["가져갈 사람을 모른다", "성수 작가·공방·다음 팝업에게 자재 지도와 알림"],
      ["얼마나 버리는지 아무도 세지 않는다", "등록 기록이 곧 팝업 폐기물 통계가 된다"],
    ];
    T(s, "원인", { x: 0.6, y: 1.65, w: 5.4, h: 0.35, fontSize: 14, bold: true, color: K.sub });
    T(s, "다음무대의 대응", { x: 7.2, y: 1.65, w: 5.4, h: 0.35, fontSize: 14, bold: true, color: st.text });
    pairs.forEach(([a, b], i) => {
      const y = 2.1 + i * 1.08;
      s.addText(a, { shape: pres.ShapeType.rect, x: 0.6, y, w: 5.9, h: 0.88, fill: { color: K.card }, line: { color: K.card }, fontSize: 16, color: K.ink, valign: "middle", margin: [14, 14, 0, 0], isTextBox: true, objectName: `cause-${i}` });
      s.addImage({ data: ic.arrow, x: 6.67, y: y + 0.27, w: 0.34, h: 0.34, objectName: `cause-arrow-${i}` });
      s.addText(b, { shape: pres.ShapeType.rect, x: 7.2, y, w: 5.5, h: 0.88, fill: { color: st.tint }, line: { color: st.tint }, fontSize: 16, bold: true, color: K.ink, valign: "middle", margin: [14, 14, 0, 0], isTextBox: true, objectName: `module-${i}` });
    });
    s.addNotes("해법은 원인 하나하나에 대응하도록 설계했다.");
  }

  // 12 overview --------------------------------------------------------
  {
    const st = STEP.solution;
    const s = content("다음무대: 찍고, 잇고, 바꾼다", st, "솔루션 설계");
    const steps = [
      ["01", "찍는다", ic.camera, "운영사가 철거 전 매장 사진을 올리면 AI가 자재 종류, 수량, 크기를 목록으로 만든다."],
      ["02", "잇는다", ic.link, "다음 팝업, 작가, 공방의 요청과 자동으로 짝짓고, 이번 달 철거 물량을 예측해 수거 일정을 짠다."],
      ["03", "바꾼다", ic.paintb, "짝을 못 찾은 자재는 성수 작가가 작품으로 만들고, 다음 크리에이티브X성수 주제전시에 세운다."],
    ];
    const heads = [K.ink, K.ink, st.c];
    steps.forEach(([n, h, img, body], i) => {
      const x = 0.6 + i * 4.15;
      s.addShape(pres.ShapeType.rect, { x, y: 1.8, w: 3.8, h: 1.25, fill: { color: heads[i] }, line: { color: heads[i] }, objectName: `ov-head-${i}` });
      s.addImage({ data: img, x: x + 0.3, y: 2.12, w: 0.6, h: 0.6, objectName: `ov-icon-${i}` });
      T(s, [{ text: n + "  ", options: { fontSize: 16, color: "D9D9D6" } }, { text: h, options: { fontSize: 26, bold: true, color: K.white } }], { x: x + 1.1, y: 2.0, w: 2.6, h: 0.85, valign: "middle" });
      s.addShape(pres.ShapeType.rect, { x, y: 3.05, w: 3.8, h: 2.35, fill: { color: K.card }, line: { color: K.card }, objectName: `ov-body-${i}` });
      T(s, body, { x: x + 0.3, y: 3.3, w: 3.2, h: 1.95, fontSize: 15, color: K.ink, valign: "top" });
      if (i < 2) s.addImage({ data: ic.arrow, x: x + 3.86, y: 3.95, w: 0.25, h: 0.25, objectName: `ov-arrow-${i}` });
    });
    paint(s, "splat_violet", 0.45, 5.62, 0.55);
    T(s, "다음 축제의 무대가 끝나면, 그 자재가 다시 다음무대로 들어온다", { x: 1.15, y: 5.65, w: 11.5, h: 0.6, fontSize: 18, bold: true, color: K.ink, valign: "middle" });
    s.addNotes("서비스 이름 '다음무대'는 자재가 다음 무대로 간다는 뜻이다.");
  }

  // 13 AI tech ---------------------------------------------------------
  {
    const st = STEP.solution;
    const s = content("AI 기술 설계: 어떤 모델이 무엇을 맡나", st, "솔루션 설계");
    const head = ["기능", "기술 (모델)", "입력 → 출력", "AI가 없으면"].map((t) => ({ text: t, options: { bold: true, color: K.white, fill: { color: K.ink } } }));
    const rows = [
      ["자재 인식", "YOLOv8-seg 인스턴스 분할\n+ CLIP 제로샷 자재 분류", "철거 전 사진 → 가벽·합판·아크릴·조명·현수막 종류와 개수", "철거 기한 안에 사람이 목록을 쓸 수 없다"],
      ["크기·무게 추정", "Depth Anything V2 단안 깊이 추정\n+ 기준 마커 보정", "사진 → 자재별 치수(cm)와 무게(kg)", "수거 차량과 보관 공간을 계산할 수 없다"],
      ["매칭", "multilingual-E5 문장 임베딩\n+ 거리·일정 조건 최적화", "자재 목록 × 작가·팝업 요청 글 → 추천 순위", "게시판에 올려 두고 기다리는 수준에 그친다"],
      ["철거 물량 예측", "LightGBM 회귀", "팝업 종료일, 과거 등록량, 생활인구 → 주별 철거 예상량", "창고와 수거 인력을 미리 배치할 수 없다"],
    ];
    s.addTable([head, ...rows.map((r) => r.map((t, j) => ({ text: t, options: j === 0 ? { bold: true, color: st.text } : {} })))], {
      x: 0.6, y: 1.75, w: 12.1, colW: [1.9, 3.6, 3.6, 3.0], fontSize: 13, color: K.ink, valign: "middle",
      border: { type: "solid", pt: 0.75, color: K.line }, fill: { color: K.white }, rowH: [0.45, 0.95, 0.95, 0.95, 0.95], margin: 0.08, objectName: "ai-table",
    });
    source(s, "프로토타입: CLIP 분류는 브라우저에서 실제로 실행(transformers.js), 분할·크기 추정은 시연용 결과. 실제 서비스에서는 성수 팝업 철거 사진으로 분류 모델을 미세조정한다", 6.45);
    s.addNotes("각 AI는 원인 슬라이드의 문제 하나씩을 맡는다.");
  }

  // 14 culture ---------------------------------------------------------
  {
    const st = STEP.solution;
    const s = content("남은 자재는 작품이 되고, 다음 축제의 주제전시가 된다", st, "솔루션 설계");
    const chain = [[ic.store, "팝업 가벽"], [ic.box, "다음무대 창고"], [ic.brushI, "성수 작가·공방"], [ic.frame, "주제전시 작품"]];
    chain.forEach(([img, label], i) => {
      const x = 0.75 + i * 1.95;
      s.addShape(pres.ShapeType.ellipse, { x, y: 1.85, w: 1.0, h: 1.0, fill: { color: st.tint }, line: { color: st.tint }, objectName: `chain-circle-${i}` });
      s.addImage({ data: img, x: x + 0.25, y: 2.1, w: 0.5, h: 0.5, objectName: `chain-icon-${i}` });
      T(s, label, { x: x - 0.35, y: 2.95, w: 1.7, h: 0.4, fontSize: 13, color: K.ink, align: "center" });
      if (i < 3) s.addImage({ data: ic.arrow, x: x + 1.27, y: 2.2, w: 0.32, h: 0.32, objectName: `chain-arrow-${i}` });
    });
    [
      ["변용 공모", "성수 작가와 공방이 회수 자재로 작업한다. 재료비는 0원이고, 자재마다 어느 팝업에서 왔는지 이력이 붙는다."],
      ["재료의 지도 (미디어아트)", "자재가 이동한 기록을 성수 지도 위 빛의 선으로 그려 투사한다. 올해 주제전시의 '시티 펄스'(실시간 도시 데이터 시각화), '시티 팰림프세스트'(도시 기록 아카이브)와 같은 형식이다."],
    ].forEach(([h, b], i) => {
      const y = 3.6 + i * 1.4;
      T(s, h, { x: 0.6, y, w: 7.4, h: 0.4, fontSize: 17, bold: true, color: st.text });
      T(s, b, { x: 0.6, y: y + 0.42, w: 7.4, h: 0.9, fontSize: 15, color: K.ink, valign: "top" });
    });
    s.addShape(pres.ShapeType.rect, { x: 8.4, y: 1.8, w: 4.3, h: 4.6, fill: { color: K.night }, line: { color: K.night }, objectName: "why-art" });
    paint(s, "splat_violet", 11.85, 5.55, 0.95, 12);
    T(s, [
      { text: "예술이 빠지면 안 되는 이유", options: { fontSize: 18, bold: true, color: K.white, breakLine: true } },
      { text: " ", options: { fontSize: 10, breakLine: true } },
      { text: "브랜드 그래픽이 인쇄된 가벽처럼 그대로는 아무도 안 쓰는 자재가 많다. 작가의 손을 거쳐야 다시 쓰인다.", options: { fontSize: 15, color: "D9D9D6", bullet: true, breakLine: true } },
      { text: "작품 라벨에 브랜드 이름이 남아 운영사가 참여할 이유가 생긴다.", options: { fontSize: 15, color: "D9D9D6", bullet: true, breakLine: true } },
      { text: "축제 주제 '창조적 변용'이 실제로 일어난다.", options: { fontSize: 15, color: "D9D9D6", bullet: true } },
    ], { x: 8.7, y: 2.1, w: 3.75, h: 4.1, valign: "top", paraSpaceAfter: 6, objectName: "why-art-text" });
    s.addNotes("예술은 장식이 아니라 재사용이 안 되는 자재의 마지막 출구다.");
  }

  // 15 user flow -------------------------------------------------------
  {
    const st = STEP.solution;
    const s = content("사용자 흐름: 철거 전부터 다음 축제까지", st, "솔루션 설계");
    const cols = ["철거 전", "철거 당일", "1~4주", "다음 축제"];
    const lanes = [
      ["팝업 운영사", ["매장 사진 등록", "자재 인계, 확인서 수령", "", "작품 라벨에 브랜드 표기"]],
      ["다음무대 AI", ["자재 인식·목록화", "수거 경로 배정", "매칭 추천, 철거량 예측", "자재 이력 지도 생성"]],
      ["작가·다음 팝업", ["자재 알림 받기", "", "자재 신청·수령", "작품 출품"]],
      ["성동구·문화재단", ["", "회수량 대시보드", "변용 공모 운영", "주제전시 개최"]],
      ["관람객", ["", "", "", "작품 QR로 재료의 길 보기"]],
    ];
    const x0 = 2.75, cw = 2.45, y0 = 1.75;
    cols.forEach((c, j) => T(s, c, { x: x0 + j * cw, y: y0, w: cw - 0.1, h: 0.4, fontSize: 14, bold: true, color: K.sub, align: "center" }));
    lanes.forEach(([name, cells], i) => {
      const y = y0 + 0.5 + i * 0.86;
      const ai = i === 1;
      s.addText(name, { shape: pres.ShapeType.rect, x: 0.6, y, w: 2.05, h: 0.74, fontSize: 14, bold: true, color: ai ? K.white : K.ink, fill: { color: ai ? st.c : K.card }, line: { color: ai ? st.c : K.card }, valign: "middle", margin: [10, 10, 0, 0], isTextBox: true, objectName: `lane-${i}` });
      cells.forEach((t, j) => {
        if (!t) return;
        s.addText(t, { shape: pres.ShapeType.rect, x: x0 + j * cw, y, w: cw - 0.1, h: 0.74, fill: { color: ai ? st.tint : K.white }, line: { color: ai ? st.tint : "CFCFCB", width: 0.75 }, fontSize: 13, color: K.ink, align: "center", valign: "middle", margin: 4, isTextBox: true, objectName: `cell-${i}-${j}` });
      });
    });
    s.addNotes("다섯 주체가 시간 순서대로 무엇을 하는지 보여준다.");
  }

  // 16 prototype -------------------------------------------------------
  {
    pres.addSection({ title: "프로토타입" });
    const st = STEP.proto;
    const s = content("프로토타입: 핵심 흐름을 직접 눌러 볼 수 있는 웹", st, "프로토타입");
    const shots = [
      ["register", "① 철거 등록", "운영사"], ["result", "② AI 인식 결과", "운영사"], ["lab-done", "③ 실제 CLIP 분석", "브라우저에서 실행"],
      ["match", "④ AI 자재 매칭", "작가·다음 팝업"], ["journey", "⑤ 재료의 지도", "관람객"],
    ];
    const sw = 1.96, sh = sw * 1688 / 780, gap = 0.17, y0 = 1.68;
    shots.forEach(([key, t, who], i) => {
      const x = 0.6 + i * (sw + gap);
      const f = PROTO + key + ".png";
      if (fs.existsSync(f)) {
        s.addImage({ path: f, x, y: y0, w: sw, h: sh, objectName: `proto-shot-${i}`, altText: `${t} 화면` });
        s.addShape(pres.ShapeType.rect, { x, y: y0, w: sw, h: sh, fill: { type: "none" }, line: { color: "D6D6D2", width: 0.75 }, objectName: `proto-frame-${i}` });
      } else photoSlot(s, x, y0, sw, sh, "화면 캡처", `proto-shot-${i}`, st);
      T(s, t, { x, y: y0 + sh + 0.1, w: sw, h: 0.32, fontSize: 13, bold: true, color: K.ink });
      T(s, who, { x, y: y0 + sh + 0.42, w: sw, h: 0.28, fontSize: 11, color: i === 2 ? st.text : K.sub, bold: i === 2 });
    });
    const qx = 0.6 + 5 * (sw + gap) + 0.05;
    s.addImage({ path: path.join(PAINT, "qr_proto.png"), x: qx, y: y0, w: 1.45, h: 1.45, objectName: "proto-qr", altText: "프로토타입 주소 QR 코드" });
    T(s, [
      { text: "직접 눌러 보기", options: { fontSize: 13, bold: true, color: K.ink, breakLine: true } },
      { text: "next-stage-seongsu\n.vercel.app", options: { fontSize: 11, color: st.text, bold: true, breakLine: true } },
      { text: " ", options: { fontSize: 6, breakLine: true } },
      { text: "로그인 없이\n바로 열린다", options: { fontSize: 11, color: K.sub } },
    ], { x: qx, y: y0 + 1.6, w: 1.5, h: 1.9, valign: "top", objectName: "proto-link" });
    source(s, "실제로 동작: CLIP 자재 분류(transformers.js, 브라우저 실행), 대시보드의 생활인구·점포 데이터  ·  시연용: 분할·크기 추정 애니메이션, 매칭 점수, 철거량 예측, 팝업·작가 데이터", 6.62);
    s.addNotes("운영사 등록부터 재료의 지도까지 다섯 화면을 시연한다. ③은 미리 계산한 값이 아니라 브라우저에서 CLIP 모델이 실제로 사진을 분류한 결과다.");
  }

  // 17 feasibility -----------------------------------------------------
  {
    pres.addSection({ title: "실행 가능성과 기대효과" });
    const st = STEP.impact;
    const s = content("실행 가능성: 누가, 얼마로, 무엇과 붙여서", st, "실행 가능성과 기대효과");
    const cards = [
      ["운영 주체", ["성동구: 총괄, 팝업 운영 매뉴얼에 '철거 전 등록' 추가", "성동문화재단: 변용 공모와 주제전시", "지역 사회적기업: 수거와 보관", "참여: 팝업 대행·시공사, 성수 작가·공방"]],
      ["1차년도 비용 (추정)", ["웹앱·모델 개발 4천만 원", "수거·운영 3천만 원", "창고: 구 유휴 공간 활용", "변용 공모·전시 2천만 원", "합계 약 9천만 원"]],
      ["기존 인프라 연계", ["성동형 팝업 운영 매뉴얼", "크리에이티브X성수 주제전시 예산", "주제전시의 데이터 시각화 작품 형식 (2026 시티 펄스)", "성수 공방·작가 네트워크", "서울 생활인구 데이터 (예측 입력)"]],
    ];
    cards.forEach(([h, items], i) => {
      const x = 0.6 + i * 4.1;
      s.addShape(pres.ShapeType.rect, { x, y: 1.75, w: 3.85, h: 3.45, fill: { color: K.card }, line: { color: K.card }, objectName: `feas-card-${i}` });
      T(s, h, { x: x + 0.25, y: 1.95, w: 3.4, h: 0.45, fontSize: 18, bold: true, color: st.text });
      T(s, items.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < items.length - 1 } })), { x: x + 0.25, y: 2.5, w: 3.4, h: 2.6, fontSize: 14, color: K.ink, valign: "top", paraSpaceAfter: 4 });
    });
    [["2027 상반기", "축제 설치물 시범"], ["2027 하반기", "연무장길 팝업 50곳"], ["2028~", "성동구 전체로 확대"]].forEach(([t, d], i) => {
      const x = 0.6 + i * 4.1;
      s.addText([{ text: t + "  ", options: { bold: true, color: PAINTS.yellow } }, { text: d, options: { color: K.white } }], {
        shape: pres.ShapeType.rect, x, y: 5.45, w: 3.85, h: 0.8, fill: { color: K.night }, line: { color: K.night }, fontSize: 15, valign: "middle", margin: [14, 14, 0, 0], isTextBox: true, objectName: `phase-${i}`,
      });
    });
    source(s, "비용은 유사 공공 웹서비스 구축비와 축제 설치 예산을 참고한 추정치", 6.45);
    s.addNotes("새 조직을 만들지 않고 구청 매뉴얼과 축제 예산에 붙이는 것이 핵심이다.");
  }

  // 18 effects ---------------------------------------------------------
  {
    const st = STEP.impact;
    const s = content("기대효과: 줄이고, 세고, 남긴다", st, "실행 가능성과 기대효과");
    [
      ["100~200톤", "연간 폐기물 감축", "성동구 팝업 폐기물 연 500톤(보도 기준 하한) 중 20~40% 재사용 가정"],
      ["첫 통계", "팝업 폐기물 기록", "등록된 철거마다 자재 종류와 양이 쌓여 구청 정책 자료가 된다"],
      ["재료비 0원", "작가·공방 지원", "회수 자재가 성수 창작자에게 가고, 작품은 다음 축제 콘텐츠가 된다"],
    ].forEach(([n, h, d], i) => {
      const x = 0.6 + i * 4.1;
      brush(s, "yellow", x - 0.1, 2.0, 3.6, 0.85);
      T(s, n, { x: x + 0.1, y: 1.85, w: 3.6, h: 1.0, fontSize: 36, bold: true, color: K.ink, valign: "middle" });
      T(s, h, { x: x + 0.1, y: 3.0, w: 3.6, h: 0.4, fontSize: 17, bold: true, color: st.text });
      T(s, d, { x: x + 0.1, y: 3.5, w: 3.55, h: 1.2, fontSize: 14, color: K.sub, valign: "top" });
    });
    s.addShape(pres.ShapeType.line, { x: 0.6, y: 4.85, w: 12.1, h: 0, line: { color: K.line, width: 1 }, objectName: "eff-rule" });
    T(s, [
      { text: "공익적 가치  ", options: { bold: true, color: st.text } },
      { text: "소각량과 처리비 감소, 성수 골목의 폐기물 방치 감소", options: { color: K.ink, breakLine: true } },
      { text: "지역 상생  ", options: { bold: true, color: st.text } },
      { text: "팝업 자본이 남긴 자재가 성수 공방과 작가에게 돌아간다", options: { color: K.ink, breakLine: true } },
      { text: "비즈니스  ", options: { bold: true, color: st.text } },
      { text: "운영사는 감축 확인서를 ESG 보고에 쓰고, 이용 수수료로 수거 운영비를 보탠다", options: { color: K.ink } },
    ], { x: 0.6, y: 5.05, w: 12.1, h: 1.35, fontSize: 15, valign: "top", paraSpaceAfter: 4, objectName: "eff-values" });
    s.addNotes("감축량은 보수적인 하한 500톤을 기준으로 잡았다.");
  }

  // 19 sources (closing, dark) ------------------------------------------
  {
    pres.addSection({ title: "데이터 출처" });
    const s = pres.addSlide({ masterName: "CLOSING", sectionTitle: "데이터 출처" });
    s.addText("데이터 출처와 참고문헌", { placeholder: "title" });
    paint(s, "splat_red", 11.55, -0.65, 2.0, 15);
    paint(s, "splat_yellow", 12.0, 5.7, 1.3, 0);
    paint(s, "splat_teal", 10.85, 0.2, 0.6, 0);
    const lines = [
      "[공공] 서울신용보증재단, 서울시 상권분석서비스(점포-행정동) OA-22172, data.seoul.go.kr/dataList/OA-22172/S/1/datasetView.do, 2021~2025년 분기 (2026.5.21 갱신)",
      "[공공] 서울특별시, 행정동 단위 서울 생활인구(내국인) OA-14991, data.seoul.go.kr/dataList/OA-14991/S/1/datasetView.do, 2025년 8~9월 파일",
      "[공공] 서울시 상권분석서비스, 행정동 코드표, golmok.seoul.go.kr/images/adstrd_code.pdf",
      "[보도] 뉴스1, 「쓰레기 쏟아내는 '성수동 팝업'…사각지대 놓인 생활폐기물」, 2024.9.8, news1.kr/society/environment/5534898",
      "[보도] 쿠키뉴스, 팝업스토어 폐기물 기사, kukinews.com/article/view/kuk202511180271",
      "[민간] 스위트스팟(팝가), 2025 팝업스토어 트렌드 리포트 — 위픽레터 letter.wepick.kr/post/23837, 바이라인네트워크 2025.7.9",
      "[행사] 성동구, 「2026 크리에이티브X성수 개최」, 서울신문 2026.9.22 · 공식 사이트 creativexseongsu.co.kr · 2026 크리에이티브X성수 공식 책자(주제전시 CT Fair) · 플레이성수 playseongsu.realworld.to",
      "[사진] 직접 촬영 2026.10.8(동행인 얼굴 흐림 처리) · 뉴스1 임여익 기자, 연무장길 팝업 공사·폐기물 봉투(2024.9.6)",
      "[코드] 분석·프로토타입 코드 github.com/minwoooo330/next-stage-seongsu · 프로토타입 next-stage-seongsu.vercel.app",
      "[생성형 AI] Claude(Anthropic): 공공데이터 수집·분석 코드 작성 보조, 문안 초안, 프로토타입 코드 작성 보조. 수치와 결론은 본인이 원자료로 검토",
    ];
    T(s, lines.map((t, i) => ({ text: t, options: { breakLine: i < lines.length - 1 } })), { x: 0.6, y: 1.75, w: 11.1, h: 4.9, fontSize: 13, color: "E6E6E3", valign: "top", paraSpaceAfter: 7, objectName: "sources" });
    s.addNotes("모든 데이터는 기관, 데이터셋 이름, 주소, 기준일을 적었다.");
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("written", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
