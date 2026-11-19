const http = require('http');

const PORT = process.env.TEST_PORT || 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function checkUrl(url, method = 'GET', postData = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: method,
        headers: {
          ...(postData ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } : {}),
          ...headers,
        },
        timeout: 10000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    if (postData) req.write(postData);
    req.end();
  });
}

async function testAutonomousSystem() {
  console.log('================================================================');
  console.log('VICEPULSE AUTONOMOUS RECON & NEWS INTELLIGENCE VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(cond, name, note = '') {
    total++;
    if (cond) {
      console.log(`[PASS] ${name} ${note}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${note}`);
    }
  }

  try {
    // 1. News Page HTTP 200
    const newsPage = await checkUrl(`${BASE_URL}/news`);
    assert(newsPage.status === 200, 'GTA VI News Page (/news) -> HTTP 200');

    // 2. News API HTTP 200
    const newsApi = await checkUrl(`${BASE_URL}/api/news`);
    assert(newsApi.status === 200, 'News List API (/api/news) -> HTTP 200');
    const newsData = JSON.parse(newsApi.body);
    assert(newsData.success === true, 'News API returned success: true');
    assert(Array.isArray(newsData.data) && newsData.data.length > 0, `News articles found: ${newsData.data.length}`);

    // 3. News Article Detail
    const firstSlug = newsData.data[0].slug;
    const detailApi = await checkUrl(`${BASE_URL}/api/news/${firstSlug}`);
    assert(detailApi.status === 200, `News Detail API (/api/news/${firstSlug}) -> HTTP 200`);
    const detailData = JSON.parse(detailApi.body);
    assert(detailData.data.title.length > 5, `Article title verified: "${detailData.data.title.slice(0, 40)}..."`);
    assert(Array.isArray(detailData.data.sources), 'Article primary sources array present');

    const articlePage = await checkUrl(`${BASE_URL}/news/${firstSlug}`);
    assert(articlePage.status === 200, `Article Page (/news/${firstSlug}) -> HTTP 200`);

    // 4. Autonomous Engine Status
    const statusApi = await checkUrl(`${BASE_URL}/api/autonomous/status`);
    assert(statusApi.status === 200, 'Autonomous Engine Status API (/api/autonomous/status) -> HTTP 200');
    const statusData = JSON.parse(statusApi.body);
    assert(statusData.success === true, 'Autonomous status reports success: true');
    assert(statusData.data.stats.totalSourcesConfigured >= 4, `Sources configured: ${statusData.data.stats.totalSourcesConfigured}`);
    assert(statusData.data.stats.totalRawContentIngested > 0, `Raw content ingested: ${statusData.data.stats.totalRawContentIngested}`);

    // 5. Sources API
    const sourcesApi = await checkUrl(`${BASE_URL}/api/autonomous/sources`);
    assert(sourcesApi.status === 200, 'Autonomous Sources API (/api/autonomous/sources) -> HTTP 200');

    // 6. Map page and Discoveries API
    const mapPage = await checkUrl(`${BASE_URL}/map`);
    assert(mapPage.status === 200, 'MapLibre Tactical Map (/map) -> HTTP 200');

    const discoveriesApi = await checkUrl(`${BASE_URL}/api/discoveries`);
    assert(discoveriesApi.status === 200, 'Discoveries API (/api/discoveries) -> HTTP 200');
    const discoveriesData = JSON.parse(discoveriesApi.body);
    assert(discoveriesData.total > 0, `Total discoveries in DB: ${discoveriesData.total}`);

    console.log(`\n================================================================`);
    console.log(`AUTONOMOUS RECON TEST RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log(`================================================================\n`);

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testAutonomousSystem();
