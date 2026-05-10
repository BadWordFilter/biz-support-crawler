import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime

# K-Startup 공고 목록 URL
TARGET_URL = "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do"

def calculate_dday(deadline_str):
    try:
        if not deadline_str or "상시" in deadline_str:
            return "상시"
        deadline_date = datetime.strptime(deadline_str.replace('.', '-'), '%Y-%m-%d')
        today = datetime.now()
        delta = deadline_date - today
        if delta.days < 0: return "마감"
        elif delta.days == 0: return "D-Day"
        else: return f"D-{delta.days}"
    except: return "상시"

def map_category(cat_text):
    if "사업화" in cat_text: return "support"
    if "금융" in cat_text or "융자" in cat_text or "보증" in cat_text: return "loan"
    if "기술개발" in cat_text or "R&D" in cat_text: return "support"
    if "행사" in cat_text or "네트워크" in cat_text: return "contest"
    return "support"

def fetch_data():
    print("K-Startup multi-page crawling start...")
    all_crawled_data = []
    seen_titles = set()
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    # 모집 중인 모든 페이지 전수 조사 (데이터가 없을 때까지 무한 루프)
    page = 1
    while True:
        url = f"{TARGET_URL}?page={page}"
        print(f"Reading Page {page}...")
        
        try:
            # 서버 부하 방지 및 차단 예방을 위해 살짝 대기
            import time
            time.sleep(0.5)
            
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # K-Startup 리스트 구조 선택자
            items = soup.select('.board_list-wrap > ul > li') or soup.select('.biz_list > li') or soup.select('.list_type01 > li')
            
            if not items:
                print(f"No more items found on Page {page}. Full collection complete.")
                break

            count_on_page = 0
            for item in items:
                title_el = item.select_one('.tit') or item.select_one('p.title')
                if not title_el: continue
                
                title = title_el.text.strip()
                if title in seen_titles: continue
                
                try:
                    link_el = item.select_one('a')
                    pbanc_sn = ""
                    detail_url = TARGET_URL
                    if link_el and 'href' in link_el.attrs:
                        href = link_el['href']
                        id_match = re.search(r"go_view\((\d+)\)", href) or re.search(r"go_view\('(\d+)'\)", href)
                        if id_match:
                            pbanc_sn = id_match.group(1)
                            detail_url = f"{TARGET_URL}?pbancClssCd=PBC010&schM=view&pbancSn={pbanc_sn}"

                    category_text = "지원사업"
                    cat_el = item.select_one('.flag') or item.select_one('.badge')
                    if cat_el: category_text = cat_el.text.strip()
                    
                    agency_type = "공공"
                    agency_el = item.select_one('.flag_agency') or item.select_one('.org')
                    if agency_el: agency_type = agency_el.text.strip()

                    region = "전국"
                    regions = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"]
                    for r in regions:
                        if r in title:
                            region = r
                            break

                    startup_term = "전체"
                    if "예비" in title: startup_term = "예비창업자"
                    elif "7년" in title: startup_term = "7년미만"
                    elif "3년" in title: startup_term = "3년미만"

                    info_list = item.select('.info li') or item.select('ul.info li')
                    organization = "기관 정보 없음"
                    views_count = 0
                    deadline_date = "상시모집"
                    
                    for info in info_list:
                        txt = info.text.strip()
                        if "조회" in txt:
                            v_m = re.search(r'(\d+)', txt)
                            if v_m: views_count = int(v_m.group(1))
                        elif "마감" in txt:
                            d_m = re.search(r'\d{4}-\d{2}-\d{2}', txt)
                            if d_m: deadline_date = d_m.group(0).replace('-', '.')
                        elif ":" not in txt and len(txt) < 30:
                            organization = txt

                    all_crawled_data.append({
                        "id": pbanc_sn or str(len(all_crawled_data) + 1),
                        "title": title,
                        "organization": organization,
                        "category": map_category(category_text),
                        "agencyType": agency_type,
                        "region": region,
                        "startupTerm": startup_term,
                        "deadline": deadline_date,
                        "dDay": calculate_dday(deadline_date),
                        "views": views_count,
                        "tags": [f"#{category_text}", f"#{region}"],
                        "link": detail_url
                    })
                    seen_titles.add(title)
                    count_on_page += 1
                except: continue
            
            print(f"Page {page}: Added {count_on_page} new items.")
            
            # 페이지당 아이템이 15개 미만이면 다음 페이지가 없을 가능성이 큼 (K-Startup 특성)
            if count_on_page == 0:
                break
                
            page += 1
            
        except Exception as e:
            print(f"Error on Page {page}: {e}")
            break

    print(f"Total collected: {len(all_crawled_data)}")
    return all_crawled_data

def save_to_js(data):
    try:
        content = f"const supportPrograms = {json.dumps(data, ensure_ascii=False, indent=4)};"
        with open('scripts/data.js', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: data.js updated.")
    except Exception as e:
        print(f"Fail: {e}")

if __name__ == "__main__":
    data = fetch_data()
    if data:
        save_to_js(data)
