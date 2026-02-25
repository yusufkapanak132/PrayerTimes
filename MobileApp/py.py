from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import json

all_data = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://www.grandmufti.bg/bg/home/vremena-za-namaz.html")

   
    city_options = [
        {"value": opt.get_attribute("value"), "text": opt.inner_text().strip()}
        for opt in page.query_selector_all("select[name='town'] option")
        if opt.inner_text().strip().lower() not in ["избери град", "select town"]
    ]

    month_options = [
        {"value": opt.get_attribute("value"), "text": opt.inner_text().strip()}
        for opt in page.query_selector_all("select[name='month'] option")
        if opt.inner_text().strip().lower() not in ["избери месец", "select month"]
    ]

    for city in city_options:
        city_name = city["text"]
        city_value = city["value"]
        print(f"Обработвам град: {city_name}")


        page.select_option("select[name='town']", city_value)
        page.wait_for_selector("table")  

        city_data = {}

        for month in month_options:
            month_text = month["text"]
            month_value = month["value"]

          
            page.select_option("select[name='month']", month_value)
            page.wait_for_selector("table") 

           
            soup = BeautifulSoup(page.content(), "html.parser")
            table = soup.find("table")
            if not table:
                continue

            headers = [th.get_text(strip=True) for th in table.find_all("th")]
            for row in table.find_all("tr")[1:]:
                cells = [td.get_text(strip=True) for td in row.find_all("td")]
                if len(cells) == len(headers):
                    day_dict = dict(zip(headers, cells))
                    day_number = day_dict.get("Ден")
                    if not day_number:
                        continue
                    date_str = f"2026-{int(month_value):02d}-{int(day_number):02d}"
                    city_data[date_str] = day_dict

        all_data[city_name] = city_data

    browser.close()


with open("all_prayer_times_2026.json", "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=4)

print("Готово! JSON файлът е създаден.")
