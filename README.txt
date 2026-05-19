KAVISTORE Mobile Telegram Landing — фикс загрузки фото

Что исправлено:
- Фото канала больше не зависит от временной ссылки Telegram CDN: добавлен локальный assets/kavistore-avatar.svg.
- Фото отзывов из Telegram при автообновлении скачиваются в assets/reviews/ и подставляются локально.
- Если Telegram всё равно заблокирует внешнюю картинку, страница не покажет битую иконку, а аккуратно уберёт пустое изображение.
- GitHub Actions теперь коммитит не только reviews.json, но и assets/reviews/*.

Как загрузить на GitHub Pages:
1. Распакуй ZIP.
2. Загрузи ВСЕ файлы и папки в корень репозитория: index.html, assets, scripts, .github, reviews.json, .nojekyll.
3. В GitHub открой Settings → Pages → Deploy from a branch → main → /root.
4. После загрузки открой Actions → Update Telegram reviews → Run workflow, чтобы сразу подтянуть отзывы и фото.

Важно:
GitHub Pages не выполняет PHP, поэтому всё работает через reviews.json + GitHub Actions.
