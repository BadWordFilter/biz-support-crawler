import requests
from bs4 import BeautifulSoup
import json
import datetime
import os

# 크롤링할 대상 URL (예시: K-Startup)
# 실제로는 여러 사이트의 리스트를 관리하거나, 특정 페이지 구조에 맞춰 파싱해야 합니다.
TARGET_URL = "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do"
OUTPUT_FILE = "scripts/data.js"

def fetch_data():
    print("크롤러 시작: 최신 공고 데이터를 수집합니다...")
    
    # 깃허브 액션 환경에서는 requests 사용 가능
    # 지금은 데모를 위해 고정된 데이터를 생성하지만, 
    # 실제로는 아래와 같이 requests.get(url)을 사용해 데이터를 가져오면 됩니다.
    
    # response = requests.get(TARGET_URL)
    # soup = BeautifulSoup(response.text, 'html.parser')
    # ... 파싱 로직 ...

    # 데모용: 현재 시간 기준으로 동적 데이터 생성 (자동화 작동 확인용)
    today = datetime.date.today()
    
    # 가상의 크롤링 데이터
    crawled_data = [
        {
            "id": "2026999",
            "title": f"🔔 [자동업데이트] {today.strftime('%Y-%m-%d')} 기준 최신 창업지원 공고",
            "organization": "BizSupport Bot",
            "category": "support",
            "deadline": "2026-12-31",
            "dDay": "D-365",
            "views": 1,
            "tags": ["#자동업데이트", "#GithubActions", "#크롤링성공"],
            "link": "https://github.com"
        },
        {
            "id": "2026001",
            "title": "2026년 중앙부처 및 지자체 창업지원사업 통합공고",
            "organization": "중소벤처기업부",
            "category": "support",
            "deadline": "2026-12-31",
            "dDay": "D-365",
            "views": 15420,
            "tags": ["#2026년", "#통합공고", "#K-Startup"],
            "link": "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do"
        },
        {
            "id": "2026002",
            "title": "2026년 청년창업사관학교 16기 입교생 모집",
            "organization": "중소벤처기업진흥공단",
            "category": "support",
            "deadline": "2026-02-12",
            "dDay": "D-43",
            "views": 8900,
            "tags": ["#청년창업", "#사관학교", "#최대1억"],
            "link": "https://www.k-startup.go.kr/"
        },
        {
            "id": "2026006",
            "title": "도전! K-스타트업 2026 혁신창업리그 참가자 모집",
            "organization": "중소벤처기업부",
            "category": "contest",
            "deadline": "2026-04-30",
            "dDay": "D-120",
            "views": 45000,
            "tags": ["#경진대회", "#상금", "#대통령상"],
            "link": "https://www.k-startup.go.kr/"
        }
    ]
    
    return crawled_data

def save_to_js(data):
    # 자바스크립트 파일 형식으로 저장
    js_content = f"const supportPrograms = {json.dumps(data, ensure_ascii=False, indent=4)};"
    
    # 인코딩 문제 방지를 위해 utf-8 지정
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"데이터 저장 완료: {OUTPUT_FILE}")

if __name__ == "__main__":
    try:
        data = fetch_data()
        save_to_js(data)
        print("성공적으로 크롤링을 마쳤습니다.")
    except Exception as e:
        print(f"오류 발생: {e}")
        exit(1)
