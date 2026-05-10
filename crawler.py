import requests
from bs4 import BeautifulSoup
import json
import datetime
import os
import re

# K-Startup 실시간 공고 페이지
TARGET_URL = "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do"
OUTPUT_FILE = "scripts/data.js"

def calculate_dday(deadline_str):
    try:
        clean_date = re.sub(r'[^0-9.]', '', deadline_str).strip('.')
        deadline = datetime.datetime.strptime(clean_date, '%Y.%m.%d').date()
        today = datetime.date.today()
        delta = deadline - today
        if delta.days > 0: return f"D-{delta.days}"
        elif delta.days == 0: return "D-Day"
        else: return "마감"
    except:
        return "상시"

def map_category(category_text):
    if '지원' in category_text or '사업화' in category_text: return 'support'
    if '공모' in category_text or '경진' in category_text: return 'contest'
    if '금융' in category_text or '융자' in category_text or '보증' in category_text: return 'loan'
    return 'support'

def fetch_data():
    print("크롤러 시작: K-Startup 실시간 데이터를 수집합니다...")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Referer': 'https://www.k-startup.go.kr/',
    }

    try:
        session = requests.Session()
        # 공통 파라미터 적용 (모집중 PBC010)
        response = session.get(TARGET_URL, headers=headers, params={'pbancClssCd': 'PBC010'}, timeout=20)
        response.raise_for_status()
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 분석 결과: K-Startup 공고는 .slide 또는 .biz_list > li 구조에 위치함
        items = soup.select('.slide') or soup.select('.biz_list > li') or soup.select('.list_type01 > li')
        
        if not items:
            print("목록을 찾지 못해 전체 페이지에서 개별 항목을 직접 탐색합니다.")
            items = soup.select('.ann_cont') # 개별 공고 내용 컨테이너

        crawled_data = []
        for item in items:
            try:
                # 1. 제목 (여러 클래스 대응)
                title_el = item.select_one('.tit') or item.select_one('.tit_wrap p')
                if not title_el: continue
                title = title_el.text.strip()
                
                # 2. 상세 링크 및 ID (정밀 추출)
                # a 태그는 .slide의 직계 자식이거나 .ann_cont의 부모일 수 있음
                link_el = item.find_parent('a') or item.select_one('a')
                if not link_el and item.parent: 
                    link_el = item.parent.select_one('a') or item.parent.find_parent('a')
                
                pbanc_sn = ""
                detail_url = "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do"
                
                if link_el and 'href' in link_el.attrs:
                    href = link_el['href']
                    # 따옴표가 있든 없든 숫자 ID를 추출 (예: go_view(177550) 또는 go_view('177550'))
                    id_match = re.search(r"go_view\((\d+)\)", href) or re.search(r"go_view\('(\d+)'\)", href)
                    if id_match:
                        pbanc_sn = id_match.group(1)
                        detail_url = f"https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?pbancClssCd=PBC010&schM=view&pbancSn={pbanc_sn}"
                    else:
                        # href 자체에 ID가 포함된 경우도 대비
                        sn_match = re.search(r"pbancSn=(\d+)", href)
                        if sn_match:
                            pbanc_sn = sn_match.group(1)
                            detail_url = f"https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?pbancClssCd=PBC010&schM=view&pbancSn={pbanc_sn}"

                # 3. 상세 메타데이터 추출 (확장)
                category_text = "지원사업"
                agency_type = "공공" # 기본값
                region = "전국"
                target_audience = "일반인"
                startup_term = "전체"
                
                # 카테고리 (flag)
                cat_el = item.select_one('.flag.type07') or item.select_one('.badge')
                if cat_el: category_text = cat_el.text.strip()
                
                # 기관구분 (flag_agency)
                agency_el = item.select_one('.flag_agency')
                if agency_el: agency_type = agency_el.text.strip()
                
                # 제목에서 지역/업력 유추 (고급 필터용)
                regions = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"]
                for r in regions:
                    if r in title:
                        region = r
                        break
                
                if "예비" in title: startup_term = "예비창업자"
                elif "7년" in title: startup_term = "7년미만"
                elif "3년" in title: startup_term = "3년미만"
                elif "1년" in title: startup_term = "1년미만"

                # 4. 기관명 및 조회수
                info_list = item.select('.info li') or item.select('ul.info li') or item.select('.bottom .list')
                info_texts = [li.text.strip() for li in info_list]
                
                organization = "기관 정보 없음"
                views_count = 0
                for info in info_texts:
                    if "조회" in info:
                        v_match = re.search(r'(\d+)', info)
                        if v_match: views_count = int(v_match.group(1).replace(',', ''))
                    elif "일자" not in info and ":" not in info and len(info) < 20:
                        organization = info.strip()
                    elif ":" in info:
                        parts = info.split(':')
                        if "기관" in parts[0] or "부서" in parts[0]:
                            organization = parts[1].strip()

                # D-Day 및 날짜
                deadline_date = "상시모집"
                d_day = "상시"
                date_texts = [t for t in info_texts if "마감일자" in t]
                if date_texts:
                    d_match = re.search(r'\d{4}-\d{2}-\d{2}', date_texts[0])
                    if d_match:
                        deadline_date = d_match.group(0).replace('-', '.')
                        d_day = calculate_dday(deadline_date)

                crawled_data.append({
                    "id": pbanc_sn or str(len(crawled_data) + 1),
                    "title": title,
                    "organization": organization,
                    "category": map_category(category_text),
                    "agencyType": agency_type,
                    "region": region,
                    "target": target_audience,
                    "startupTerm": startup_term,
                    "deadline": deadline_date,
                    "dDay": d_day,
                    "views": views_count,
                    "tags": [f"#{category_text}", f"#{region}", f"#{agency_type}"],
                    "link": detail_url
                })

            except: continue

        print(f"성공적으로 {len(crawled_data)}개의 공고를 수집했습니다.")
        return crawled_data
    except Exception as e:
        print(f"치명적 오류: {e}")
        return []

def save_to_js(data):
    if not data: return
    js_content = f"const supportPrograms = {json.dumps(data, ensure_ascii=False, indent=4)};"
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"데이터 저장 완료: {OUTPUT_FILE}")

if __name__ == "__main__":
    data = fetch_data()
    save_to_js(data)
