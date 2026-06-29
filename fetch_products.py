import asyncio
import json
import os
import re
from pathlib import Path
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = int(os.getenv("TG_API_ID", "34021481"))
API_HASH = os.getenv("TG_API_HASH", "").strip()
TG_SESSION_STRING = os.getenv("TG_SESSION_STRING", "").strip()
CHANNEL = os.getenv("TG_CHANNEL", "kavi_store").lstrip("@")
LIMIT = int(os.getenv("TG_SCAN_LIMIT", "1500"))
MAX_PRODUCTS = int(os.getenv("TG_MAX_PRODUCTS", "200"))

BASE_DIR = Path(".")
PRODUCTS_DIR = BASE_DIR / "assets" / "products"
PRODUCTS_JSON = BASE_DIR / "products.json"
PRODUCTS_DIR.mkdir(parents=True, exist_ok=True)

def clean_text(text):
    return (text or "").replace("\xa0", " ").strip()

def first_line(text):
    lines = [x.strip() for x in clean_text(text).splitlines() if x.strip()]
    return lines[0] if lines else "Товар KAVISTORE"

def extract_price(text):
    m = re.search(r"Цена\s*:\s*(.+)", text, re.IGNORECASE)
    return m.group(1).strip() if m else "Цена в Telegram"

def extract_sizes(text):
    m = re.search(r"Размер\s*:\s*(.+)", text, re.IGNORECASE)
    return m.group(1).strip() if m else "Размеры уточняйте"

def extract_code(text):
    m = re.search(r"Код товара\s*:\s*([0-9A-Za-zА-Яа-я_-]+)", text, re.IGNORECASE)
    return m.group(1).strip() if m else ""

def is_product_post(text):
    return bool(re.search(r"Цена\s*:", text, re.IGNORECASE) and re.search(r"Код товара\s*:", text, re.IGNORECASE))

async def main():
    api_hash = API_HASH or input("API_HASH: ").strip()
    session = StringSession(TG_SESSION_STRING) if TG_SESSION_STRING else "kavistore"
    client = TelegramClient(session, API_ID, api_hash)
    await client.start()
    products = []
    async for msg in client.iter_messages(CHANNEL, limit=LIMIT):
        text = clean_text(msg.message)
        if not text or not is_product_post(text):
            continue
        code = extract_code(text)
        title = first_line(text)
        price = extract_price(text)
        sizes = extract_sizes(text)
        image_path = ""
        if msg.photo:
            filename = f"{code or msg.id}.jpg"
            target = PRODUCTS_DIR / filename
            await client.download_media(msg, file=str(target))
            image_path = str(target).replace("\\", "/")
        manager_text = f"Здравствуйте! Хочу заказать товар {code}" if code else "Здравствуйте! Хочу заказать товар"
        products.append({
            "id": str(msg.id),
            "code": code,
            "title": title,
            "price": price,
            "sizes": sizes,
            "image": image_path,
            "link": f"https://t.me/{CHANNEL}/{msg.id}",
            "manager_link": "https://t.me/kavi_manager?text=" + manager_text.replace(" ", "%20")
        })
        if len(products) >= MAX_PRODUCTS:
            break
    data = {"channel": CHANNEL, "count": len(products), "products": products}
    PRODUCTS_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ Готово. Сохранено товаров: {len(products)}")
    print(f"📄 Файл: {PRODUCTS_JSON}")

asyncio.run(main())
