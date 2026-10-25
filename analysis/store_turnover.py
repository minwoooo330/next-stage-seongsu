"""성수 4개 동과 서울 전체의 등록 점포 교체율 (2021~2025).

교체율 = (연간 개업 점포 수 + 연간 폐업 점포 수) / 분기 평균 점포 수(점포_수)
CSV 열 순서는 OpenAPI 응답과 다르다. 반드시 파일 머리글 순서를 따른다.

    python store_turnover.py      # results/store_turnover.csv
"""
import glob
import io
import os
import zipfile

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "data", "raw", "OA-22172")
OUT = os.path.join(HERE, "results")

SEONGSU = {"11200650": "성수1가1동", "11200660": "성수1가2동", "11200670": "성수2가1동", "11200690": "성수2가3동"}
COLS = ["quarter", "dong", "dong_name", "industry", "industry_name", "stores", "similar_stores", "open_rate", "opened", "close_rate", "closed", "franchise"]


def read_zip(path):
    with zipfile.ZipFile(path) as z:
        name = [n for n in z.namelist() if n.lower().endswith(".csv")][0]
        raw = z.read(name)
    for enc in ("cp949", "utf-8-sig"):
        try:
            return pd.read_csv(io.BytesIO(raw), encoding=enc, dtype=str)
        except UnicodeDecodeError:
            continue
    raise ValueError(path)


def yearly(df):
    q = df.groupby(["year", "quarter"])[["stores", "opened", "closed"]].sum().reset_index()
    y = q.groupby("year").agg(stores=("stores", "mean"), opened=("opened", "sum"), closed=("closed", "sum"))
    y["turnover_pct"] = (y.opened + y.closed) / y.stores * 100
    return y


def main():
    frames = []
    for path in sorted(glob.glob(os.path.join(RAW, "*.zip"))):
        d = read_zip(path)
        assert list(d.columns)[5:11] == ["점포_수", "유사_업종_점포_수", "개업_율", "개업_점포_수", "폐업_률", "폐업_점포_수"], d.columns
        d.columns = COLS[: len(d.columns)]
        frames.append(d)
    df = pd.concat(frames)
    for c in ["stores", "opened", "closed"]:
        df[c] = pd.to_numeric(df[c])
    df["year"] = df.quarter.str[:4]

    seongsu = yearly(df[df.dong.isin(SEONGSU)]).add_prefix("seongsu_")
    seoul = yearly(df).add_prefix("seoul_")
    out = seongsu.join(seoul).round(1)
    os.makedirs(OUT, exist_ok=True)
    out.to_csv(os.path.join(OUT, "store_turnover.csv"), encoding="utf-8-sig")
    print(out[["seongsu_turnover_pct", "seoul_turnover_pct"]].to_string())


if __name__ == "__main__":
    main()
