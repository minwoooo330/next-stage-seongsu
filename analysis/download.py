"""서울 열린데이터광장에서 분석에 쓴 원자료를 내려받는다.

    python download.py            # data/raw/ 아래에 저장
    python download.py --list     # 내려받을 파일 목록만 확인

- OA-22172 서울시 상권분석서비스(점포-행정동), 2021~2025년 (연도별 zip, 각 약 1MB)
- OA-14991 행정동 단위 서울 생활인구(내국인), 2025년 8·9월 (월별 zip, 합계 약 100MB)
"""
import os
import re
import sys
import urllib.parse
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
RAW = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "raw")

WANTED = {
    "OA-22172": ["2021년", "2022년", "2023년", "2024년", "2025년"],
    "OA-14991": ["LOCAL_PEOPLE_DONG_202508.zip", "LOCAL_PEOPLE_DONG_202509.zip"],
}


def file_list(inf_id):
    """데이터셋 페이지의 파일 목록과 다운로드 번호를 읽는다."""
    url = f"https://data.seoul.go.kr/dataList/{inf_id}/S/1/datasetView.do"
    page = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read().decode("utf-8", "ignore")
    inf_seq = re.search(r'name="frmFile".*?name="infSeq" value="(\d+)"', page, re.S).group(1)
    files = {}
    for name, seq in re.findall(r"title=\"([^\"]+)\" onclick=\"javascript:downloadFile\('(\d+)'\)", page):
        files.setdefault(name, seq)
    return inf_seq, files


def download(inf_id, inf_seq, name, seq, out_dir):
    body = urllib.parse.urlencode({"infId": inf_id, "seqNo": "", "seq": seq, "infSeq": inf_seq}).encode()
    req = urllib.request.Request(
        "https://datafile.seoul.go.kr/bigfile/iot/inf/nio_download.do?&useCache=false",
        data=body,
        headers={**UA, "Referer": f"https://data.seoul.go.kr/dataList/{inf_id}/S/1/datasetView.do"},
    )
    data = urllib.request.urlopen(req, timeout=600).read()
    if len(data) < 1000:  # 잘못된 요청이면 짧은 안내 페이지가 온다
        raise RuntimeError(f"{name}: 다운로드 실패 ({len(data)} bytes)")
    path = os.path.join(out_dir, name)
    with open(path, "wb") as f:
        f.write(data)
    return path, len(data)


def main():
    only_list = "--list" in sys.argv
    for inf_id, keys in WANTED.items():
        inf_seq, files = file_list(inf_id)
        picked = [(n, s) for n, s in files.items() if any(k in n for k in keys)]
        out_dir = os.path.join(RAW, inf_id)
        os.makedirs(out_dir, exist_ok=True)
        for name, seq in sorted(picked):
            if only_list:
                print(inf_id, name)
                continue
            if os.path.exists(os.path.join(out_dir, name)):
                print("있음", name)
                continue
            path, size = download(inf_id, inf_seq, name, seq, out_dir)
            print(f"받음 {name} ({size / 1e6:.1f}MB)")


if __name__ == "__main__":
    main()
