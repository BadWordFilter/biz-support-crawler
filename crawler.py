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
                
                # 2. 상세 링크 및 ID
                # 부모나 형제 요소에서 a 태그 탐색
                link_el = item.find_parent('a') or item.select_one('a')
                if not link_el and item.parent: link_el = item.parent.select_one('a')
                
                pbanc_id = ""
                detail_url = "https://www.k-startup.go.kr/"
                if link_el and 'href' in link_el.attrs:
                    id_match = re.search(r"go_view\('([^']+)'\)", link_el['href'])
                    if id_match:
                        pbanc_id = id_match.group(1)
                        detail_url = f"https://www.k-startup.go.kr/web/contents/bizpbanc-view.do?pbancId={pbanc_id}"

                # 3. 카테고리 및 D-Day (상단 배지 영역)
                # .slide 내부에서는 .ann_top 아래에 위치함
                top_el = item.find_previous_sibling('.ann_top') or item.select_one('.ann_top') or item.find('.ann_top')
                if not top_el and item.parent: top_el = item.parent.select_one('.ann_top')
                
                category_text = "지원사업"
                d_day = "상시"
                deadline_date = "상시모집"
                
                if top_el:
                    cat_el = top_el.select_one('.flag.type07') or top_el.select_one('.badge')
                    if cat_el: category_text = cat_el.text.strip()
                    
                    dday_el = top_el.select_one('.flag.day') or top_el.select_one('.dday')
                    if dday_el: d_day = dday_el.text.strip()
                    
                    date_el = top_el.select_one('.txt')
                    if date_el:
                        date_match = re.search(r'\d{4}-\d{2}-\d{2}', date_el.text) or re.search(r'\d{4}\.\d{2}\.\d{2}', date_el.text)
                        if date_match: deadline_date = date_match.group(0).replace('-', '.')

                # 4. 기관명 및 조회수
                info_list = item.select('.info li') or item.select('ul.info li')
                info_texts = [li.text.strip() for li in info_list]
                
                organization = "기관 정보 없음"
                views_count = 0
                if len(info_texts) >= 1:
                    organization = info_texts[0].split(':')[-1].strip()
                if len(info_texts) >= 2:
                    views_match = re.search(r'(\d+)', info_texts[-1])
                    if views_match: views_count = int(views_match.group(1))

                # D-Day 재계산 (날짜가 있는 경우 정확하게)
                if deadline_date and deadline_date != "상시모집":
                    d_day = calculate_dday(deadline_date)

                crawled_data.append({
                    "id": pbanc_id or str(len(crawled_data) + 1),
                    "title": title,
                    "organization": organization,
                    "category": map_category(category_text),
                    "deadline": deadline_date,
                    "dDay": d_day,
                    "views": views_count,
                    "tags": [f"#{category_text}", f"#{organization[:6].strip()}"],
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
