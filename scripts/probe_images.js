const http = require('http');
const https = require('https');

function fetchHtml(path) {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:3000' + path, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function checkUrl(url) {
  return new Promise(resolve => {
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve({ status: res.statusCode, location: res.headers.location });
    });
    req.on('error', err => resolve({ status: 'ERR', message: err.message }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ status: 'TIMEOUT' });
    });
  });
}

async function probe() {
  const pages = ['/', '/feed', '/map', '/vehicles', '/trending', '/news', '/profile'];
  const allImages = new Set();
  for (const p of pages) {
    const html = await fetchHtml(p);
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      let src = match[1].replace(/&amp;/g, '&');
      allImages.add(src);
    }
  }
  console.log('Testing', allImages.size, 'images...');
  let failed = 0;
  for (const img of allImages) {
    const target = img.startsWith('/') ? 'http://127.0.0.1:3000' + img : img;
    const res = await checkUrl(target);
    const ok = res.status === 200 || res.status === 302 || res.status === 301;
    if (!ok) {
      console.log('FAILED:', img, '->', res);
      failed++;
    } else {
      console.log('OK:', res.status, img.substring(0, 70));
    }
  }
  console.log(`Probe complete: ${allImages.size - failed}/${allImages.size} succeeded (${failed} failed).`);
}

probe().catch(console.error);
