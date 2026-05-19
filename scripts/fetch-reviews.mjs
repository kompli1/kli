import https from 'node:https';
import fs from 'node:fs/promises';
import path from 'node:path';

const channel = process.env.TELEGRAM_REVIEWS_CHANNEL || 'otziv_kavistore';
const limit = Number(process.env.REVIEWS_LIMIT || 8);
const url = `https://t.me/s/${channel}`;
const reviewsDir = 'assets/reviews';

const manualReviews = [
  {
    "text": "Пришла моя посылка в город Ош за 2 дня. Костюм жилета и кроссовки, все отлично 👍🏻\nВсе пришло в том виде как и говорили, качество отличное, к телу очень приятный. Спасибо вам больше ❤️",
    "meta": "Ош • 2 дня",
    "link": "https://t.me/otziv_kavistore"
  },
  {
    "text": "Добрый день. Костюм пришел в Алмату за 2 дня. Все супер спасибо, доставили прямо на дом 🩷",
    "meta": "Алматы • 2 дня",
    "link": "https://t.me/otziv_kavistore"
  },
  {
    "text": "Камила, спасибо большое за джинсы ❤️\nВ Беларусь пришли очень быстро, я прям честно не ожидала что так быстро приедет. Качество отличное, материал также отличный. Буду обращаться к вам ещё 😘",
    "meta": "Беларусь • быстрая доставка",
    "link": "https://t.me/otziv_kavistore"
  },
  {
    "text": "Камила, добрый день. Получила костюм в Минске на Европочте, все пришло без проблем за 5 дней. Спасибо вам большое. Качество великолепно, уже стирала его — ничего не скатывается, все хорошо. Буду делать ещё заказы у вас спасибо",
    "meta": "Минск • 5 дней",
    "link": "https://t.me/otziv_kavistore"
  },
  {
    "text": "Бишкек шаарына болгону 3 күндө жетип келди, абдан тез. Куртка жылуу, жеңил жана үстүмдө абдан кооз көрүнөт. Өлчөмү да идеалдуу туура келди, кийүүгө абдан ыңгайлуу.",
    "meta": "Бишкек • 3 күн",
    "link": "https://t.me/otziv_kavistore"
  }
];

function requestText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; GitHubPagesReviewsBot/1.0)',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(requestText(new URL(res.headers.location, url).toString()));
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(25000, () => req.destroy(new Error('Request timeout')));
  });
}

function requestBuffer(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; GitHubPagesReviewsBot/1.0)',
        'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(requestBuffer(new URL(res.headers.location, url).toString()));
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Image HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || '' }));
    });
    req.on('error', reject);
    req.setTimeout(25000, () => req.destroy(new Error('Image timeout')));
  });
}

function decodeHtml(input = '') {
  return input
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function absoluteUrl(value = '') {
  value = value.trim().replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
  if (!value) return '';
  if (value.startsWith('//')) return 'https:' + value;
  if (value.startsWith('/')) return 'https://t.me' + value;
  if (/^https:\/\//i.test(value)) return value;
  return '';
}

function extractReviews(html) {
  const out = [];
  const parts = html.split('<div class="tgme_widget_message_wrap');
  for (const rawPart of parts.slice(1)) {
    const part = '<div class="tgme_widget_message_wrap' + rawPart.split('<div class="tgme_widget_message_wrap')[0];
    const postMatch = part.match(/href="(https:\/\/t\.me\/[^"#]+\/\d+)"[^>]*class="tgme_widget_message_date"/);
    const link = postMatch ? postMatch[1] : `https://t.me/${channel}`;

    const textMatch = part.match(/<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/);
    const text = textMatch ? decodeHtml(textMatch[1]) : '';

    let image = '';
    const photoMatch = part.match(/tgme_widget_message_photo_wrap[^>]*style="[^"]*background-image:\s*url\(['"]?([^'")]+)['"]?\)/i);
    if (photoMatch) image = absoluteUrl(photoMatch[1]);
    if (!image) {
      const imgMatch = part.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) image = absoluteUrl(imgMatch[1]);
    }

    const dateMatch = part.match(/<time[^>]+datetime="([^"]+)"/);
    const date = dateMatch ? dateMatch[1].slice(0, 10) : 'Telegram';

    if (text || image) out.push({ text, image, link, meta: date });
  }
  return out.slice(-limit).reverse();
}

function extensionFromContentType(contentType, fallbackUrl) {
  const clean = String(contentType || '').split(';')[0].trim().toLowerCase();
  if (clean.includes('webp')) return '.webp';
  if (clean.includes('png')) return '.png';
  if (clean.includes('gif')) return '.gif';
  if (clean.includes('jpeg') || clean.includes('jpg')) return '.jpg';
  const ext = path.extname(new URL(fallbackUrl).pathname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) return ext === '.jpeg' ? '.jpg' : ext;
  return '.jpg';
}

async function localizeReviewImages(items) {
  await fs.mkdir(reviewsDir, { recursive: true });
  const used = new Set();
  let counter = 1;

  for (const item of items) {
    if (!item.image || !/^https:\/\//i.test(item.image)) continue;
    try {
      const original = item.image;
      const { buffer, contentType } = await requestBuffer(original);
      if (!buffer || buffer.length < 1000) throw new Error('Image too small');
      const ext = extensionFromContentType(contentType, original);
      const name = `review-${String(counter).padStart(2, '0')}${ext}`;
      counter += 1;
      const filePath = path.join(reviewsDir, name);
      await fs.writeFile(filePath, buffer);
      item.image = filePath.replaceAll('\\', '/');
      used.add(item.image);
    } catch (err) {
      console.warn(`Could not download review image: ${err.message}`);
      // Keep external URL as fallback. index.html hides broken images if Telegram blocks hotlinking.
    }
  }

  // Remove old localized review images that are no longer used.
  try {
    const files = await fs.readdir(reviewsDir);
    await Promise.all(files.map(async (file) => {
      const full = `${reviewsDir}/${file}`;
      if (!used.has(full) && /^review-\d+\./.test(file)) await fs.rm(full, { force: true });
    }));
  } catch (_) {}

  return items;
}

function mergeReviews(fetchedReviews, manualReviews) {
  const result = [];
  const seen = new Set();
  for (const item of [...(fetchedReviews || []), ...(manualReviews || [])]) {
    const key = String(item.text || item.image || item.link || '').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

try {
  const html = await requestText(url);
  const fetchedReviews = await localizeReviewImages(extractReviews(html));
  const reviews = mergeReviews(fetchedReviews, manualReviews);
  if (!reviews.length) throw new Error('No public reviews found. Check that the Telegram channel is public and has visible posts.');

  const data = {
    channel,
    updated_at: new Date().toISOString(),
    source: url,
    manual_reviews: manualReviews.length,
    image_mode: 'local-download-to-assets/reviews',
    reviews
  };
  await fs.writeFile('reviews.json', JSON.stringify(data, null, 2), 'utf8');
  console.log(`Saved ${reviews.length} reviews from @${channel}, including ${manualReviews.length} manual reviews`);
} catch (error) {
  console.error('Failed to update reviews:', error.message);
  process.exitCode = 1;
}
