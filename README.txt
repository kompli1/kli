KAVISTORE — лендинг с автообновлением товаров из Telegram

Что изменено:
- Товары на сайте теперь подгружаются из products.json, а не прописаны вручную в index.html.
- Цена выводится полной строкой из Telegram-поста, например:
  7000 ₸ (🇰🇿) 45 Br (🇧🇾) 1300 COM (🇰🇬) 180000 СУМ (🇺🇿) 150 с (🇹🇯)
- Добавлен скрипт scripts/fetch-products.py для чтения постов @kavi_store через Telethon.
- Добавлен GitHub Actions workflow .github/workflows/update-products.yml для автообновления каждые 3 часа.
- Добавлен products.json как источник товаров для сайта.
- Сохранены Meta Pixel ID 1676612600147113 и события кликов по Telegram.
- Добавлен .gitignore, чтобы Telegram-сессия не попала в GitHub.

Важно для GitHub Actions:
В Settings → Secrets and variables → Actions нужно добавить:
- TG_API_ID
- TG_API_HASH
- TG_SESSION_STRING

Чтобы получить TG_SESSION_STRING в Codespaces:
1. Убедитесь, что файл kavistore.session уже создан после авторизации.
2. Выполните: python3 scripts/export-session-string.py
3. Скопируйте выведенную длинную строку в GitHub Secret TG_SESSION_STRING.

После этого GitHub Actions сможет сам обновлять products.json и фото товаров.
