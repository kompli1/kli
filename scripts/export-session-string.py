import os
from telethon.sync import TelegramClient
from telethon.sessions import StringSession

api_id = int(os.getenv("TG_API_ID", "34021481"))
api_hash = os.getenv("TG_API_HASH") or input("API_HASH: ").strip()
with TelegramClient("kavistore", api_id, api_hash) as client:
    print("\nTG_SESSION_STRING:\n")
    print(StringSession.save(client.session))
