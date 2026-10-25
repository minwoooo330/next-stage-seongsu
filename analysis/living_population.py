"""2025 크리에이티브X성수 축제 기간(9.15~21)의 성수동 생활인구를 평소와 비교한다.

- 대상: 성수1가1·1가2·2가1·2가3동 합계, 시간대별 총생활인구
- 축제 주말: 2025.9.20~21 / 평소 주말: 8.23~24, 8.30~31, 9.6~7, 9.13~14, 9.27~28
- 축제 평일: 9.15~19 / 평소 평일: 8.18~9.12, 9.22~26 (8.15 광복절 주간 제외)

    python living_population.py
      → results/seongsu_living_pop_2025-08_09.csv (성수 4개 동만 추린 시간대별 자료)
      → results/chart_lp.json (발표자료·프로토타입 차트용)
"""
import csv
import io
import json
import os
import zipfile

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "data", "raw", "OA-14991")
OUT = os.path.join(HERE, "results")
SEONGSU = {"11200650", "11200660", "11200670", "11200690"}
FILES = ["LOCAL_PEOPLE_DONG_202508.zip", "LOCAL_PEOPLE_DONG_202509.zip"]


def extract():
    """월별 zip(약 1.8억 행)에서 성수 4개 동 행만 추린다. 앞 4개 열(일자, 시간대, 행정동, 총생활인구)만 쓴다."""
    rows = []
    for name in FILES:
        with zipfile.ZipFile(os.path.join(RAW, name)) as z:
            inner = [n for n in z.namelist() if n.lower().endswith(".csv")][0]
            with z.open(inner) as fh:
                # 숫자 열만 쓰므로 인코딩(파일마다 cp949/utf-8)과 무관하게 latin-1로 읽는다
                reader = csv.reader(io.TextIOWrapper(fh, encoding="latin-1"))
                next(reader)
                for r in reader:
                    if r[2] in SEONGSU:
                        rows.append((r[0], int(r[1]), r[2], float(r[3])))
    df = pd.DataFrame(rows, columns=["date", "hour", "dong", "pop"])
    df.to_csv(os.path.join(OUT, "seongsu_living_pop_2025-08_09.csv"), index=False)
    return df


def compare(total, fest_days, base_days):
    f = total[total.date.isin(fest_days)].groupby("hour")["pop"].mean()
    b = total[total.date.isin(base_days)].groupby("hour")["pop"].mean()
    return f, b, (f / b - 1) * 100


def main():
    os.makedirs(OUT, exist_ok=True)
    cached = os.path.join(OUT, "seongsu_living_pop_2025-08_09.csv")
    df = pd.read_csv(cached, dtype={"date": str, "dong": str}) if os.path.exists(cached) and not os.path.exists(os.path.join(RAW, FILES[0])) else extract()
    total = df.groupby(["date", "hour"])["pop"].sum().reset_index()

    fest_we = ["20250920", "20250921"]
    base_we = ["20250823", "20250824", "20250830", "20250831", "20250906", "20250907", "20250913", "20250914", "20250927", "20250928"]
    f, b, pct = compare(total, fest_we, base_we)
    afternoon = (f.loc[13:18].mean() / b.loc[13:18].mean() - 1) * 100
    print(f"축제 주말 13~18시 평균: {afternoon:+.1f}%  (최대 {pct.max():+.1f}%, {pct.idxmax()}시, +{(f - b).max():,.0f}명)")

    days = pd.to_datetime(total.date.unique())
    weekdays = [d.strftime("%Y%m%d") for d in days if d.dayofweek < 5]
    fest_wd = [d for d in weekdays if "20250915" <= d <= "20250919"]
    base_wd = [d for d in weekdays if ("20250818" <= d <= "20250912") or ("20250922" <= d <= "20250926")]
    _, _, pct_wd = compare(total, fest_wd, base_wd)
    print(f"축제 평일 시간대별 차이: {pct_wd.min():+.1f}% ~ {pct_wd.max():+.1f}%")

    with open(os.path.join(OUT, "chart_lp.json"), "w", encoding="utf-8") as fh:
        json.dump({"hours": list(range(24)), "fest": [round(x) for x in f], "base": [round(x) for x in b], "pct": [round(x, 1) for x in pct]}, fh)


if __name__ == "__main__":
    main()
