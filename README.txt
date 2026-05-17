KAVISTORE Mobile Telegram Landing для GitHub Pages

Что внутри:
- index.html — мобильная страница
- reviews.json — отзывы для карусели
- assets/telegram-verified.png — галочка верификации
- scripts/fetch-reviews.mjs — скрипт для автообновления отзывов из Telegram
- .github/workflows/update-reviews.yml — GitHub Actions для обновления reviews.json
- .nojekyll — чтобы GitHub Pages корректно отдавал папку .github и assets

Как загрузить:
1. Распакуйте ZIP.
2. Загрузите все файлы и папки в корень репозитория GitHub.
3. В GitHub откройте Settings → Pages.
4. Выберите Deploy from a branch → main → /root.
5. Подождите 1–3 минуты.

Важно:
- GitHub Pages не поддерживает PHP, поэтому отзывы берутся из reviews.json.
- GitHub Actions пробует подтягивать отзывы из https://t.me/s/otziv_kavistore и добавляет их к ручным отзывам.
- Если Telegram временно не отдаёт канал, сайт всё равно показывает отзывы из reviews.json.
- Facebook Pixel ID: 1676612600147113.
- Событие PageView срабатывает при открытии страницы.
- Событие Lead и TelegramClick срабатывают при клике на аватар или кнопку Telegram.


Обновление: фон заменён на фирменный KAVISTORE/KV в той же зелёно-бежевой палитре, без старых Telegram-фигур.
