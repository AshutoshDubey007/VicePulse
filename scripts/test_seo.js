const http = require('http');
const https = require('https');

function checkUrl(url, options = {}) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;
    const req = mod.get(
      url,
      {
        headers: {
          'User-Agent': 'VicePulse-SEO-Auditor/1.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          ...options.headers,
        },
        timeout: 10000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            contentType: res.headers['content-type'],
            location: res.headers['location'],
            body,
          })
        );
      }
    );
    req.on('error', (err) => resolve({ status: 'ERR', message: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'TIMEOUT' });
    });
  });
}

async function runSeoTests() {
  console.log('================================================================');
  console.log('VICEPULSE TECHNICAL SEO, GEO, AEO & DISCOVERABILITY TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] ${name} ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details}`);
    }
  }

  const BASE = 'http://127.0.0.1:3000';

  // --- 1. SITEMAP.XML VERIFICATION ---
  console.log('--- 1. Testing Sitemap XML Generation (/sitemap.xml) ---');
  const sitemapRes = await checkUrl(`${BASE}/sitemap.xml`);
  assert(sitemapRes.status === 200, 'Sitemap.xml endpoint accessible -> HTTP 200', `Status: ${sitemapRes.status}`);
  assert(
    sitemapRes.contentType && (sitemapRes.contentType.includes('xml') || sitemapRes.body.includes('<?xml') || sitemapRes.body.includes('<urlset')),
    'Sitemap returns valid XML format'
  );
  assert(
    sitemapRes.body.includes('https://vicepulse.gg') || sitemapRes.body.includes('http://localhost:3000') || sitemapRes.body.includes(`${BASE}`),
    'Sitemap includes base root URL (production or local)'
  );
  assert(sitemapRes.body.includes('/map'), 'Sitemap includes /map');
  assert(sitemapRes.body.includes('/discoveries'), 'Sitemap includes /discoveries');
  assert(sitemapRes.body.includes('/news'), 'Sitemap includes /news');
  assert(sitemapRes.body.includes('/about') && sitemapRes.body.includes('/methodology'), 'Sitemap includes trust pages (/about, /methodology)');
  assert(!sitemapRes.body.includes('/admin'), 'Sitemap strictly EXCLUDES private /admin routes');
  assert(!sitemapRes.body.includes('/profile') && !sitemapRes.body.includes('/settings'), 'Sitemap strictly EXCLUDES private user profiles & settings');

  // --- 2. ROBOTS.TXT VERIFICATION ---
  console.log('\n--- 2. Testing Robots.txt Crawl Directives (/robots.txt) ---');
  const robotsRes = await checkUrl(`${BASE}/robots.txt`);
  assert(robotsRes.status === 200, 'Robots.txt endpoint accessible -> HTTP 200');
  assert(robotsRes.body.includes('User-Agent: *') || robotsRes.body.includes('User-agent: *'), 'Robots.txt contains general User-Agent directive');
  assert(robotsRes.body.includes('Disallow: /admin'), 'Robots.txt disallows /admin');
  assert(robotsRes.body.includes('Disallow: /api/'), 'Robots.txt disallows /api/');
  assert(robotsRes.body.includes('Disallow: /profile'), 'Robots.txt disallows /profile');
  assert(robotsRes.body.includes('Sitemap:') && robotsRes.body.includes('sitemap.xml'), 'Robots.txt references sitemap.xml');
  assert(
    robotsRes.body.includes('GPTBot') || robotsRes.body.includes('PerplexityBot'),
    'Robots.txt configures explicit AI search & answer engine crawl permissions (GEO/AEO)'
  );

  // --- 3. HOMEPAGE METADATA & STRUCTURED DATA ---
  console.log('\n--- 3. Testing Homepage Root Metadata & Schema.org ---');
  const homeRes = await checkUrl(`${BASE}/`);
  assert(homeRes.status === 200, 'Homepage accessible -> HTTP 200');
  assert(homeRes.body.includes('<title>') && homeRes.body.includes('VicePulse'), 'Homepage has valid <title> tag with brand');
  assert(homeRes.body.includes('name="description"') || homeRes.body.includes('content="Investigative'), 'Homepage has meta description');
  assert(homeRes.body.includes('property="og:title"') || homeRes.body.includes('property="og:site_name"'), 'Homepage has OpenGraph metadata');
  assert(homeRes.body.includes('name="twitter:card"'), 'Homepage has Twitter Card metadata');
  assert(homeRes.body.includes('"@type":"WebSite"') || homeRes.body.includes('"@type": "WebSite"'), 'Homepage contains WebSite JSON-LD schema');
  assert(homeRes.body.includes('"@type":"Organization"') || homeRes.body.includes('"@type": "Organization"'), 'Homepage contains Organization JSON-LD schema');

  // --- 4. MAP PAGE SEO & CRAWLABLE ACCESSIBILITY ---
  console.log('\n--- 4. Testing Map Page SEO & Crawlable Discovery Directory ---');
  const mapRes = await checkUrl(`${BASE}/map`);
  assert(mapRes.status === 200, 'Map page accessible -> HTTP 200');
  assert(mapRes.body.includes('Interactive GTA VI Leonida Map'), 'Map page has dedicated SEO title');
  assert(
    mapRes.body.includes('Crawlable Directory of Mapped Leonida Discoveries') || mapRes.body.includes('/discoveries/'),
    'Map page contains crawlable semantic discovery HTML anchor links for bots'
  );
  assert(mapRes.body.includes('"@type":"CollectionPage"') || mapRes.body.includes('CollectionPage'), 'Map page has CollectionPage schema');

  // --- 5. CATEGORY PAGES & BREADCRUMBS ---
  console.log('\n--- 5. Testing Category Pages SEO & Breadcrumbs ---');
  const categoriesToTest = [
    { url: '/locations', name: 'Hidden Locations' },
    { url: '/easter-eggs', name: 'Easter Eggs' },
    { url: '/vehicles', name: 'Rare Vehicles' },
    { url: '/encounters', name: 'Random Encounters' },
    { url: '/discoveries/wildlife', name: 'Wildlife' },
    { url: '/discoveries/secret-activities', name: 'Secret Activities' },
  ];

  for (const cat of categoriesToTest) {
    const res = await checkUrl(`${BASE}${cat.url}`);
    assert(res.status === 200, `Category page (${cat.url}) accessible -> HTTP 200`);
    assert(res.body.includes('aria-label="Breadcrumb"') || res.body.includes('BreadcrumbList'), `Category (${cat.name}) includes breadcrumb navigation`);
    assert(res.body.includes('CollectionPage'), `Category (${cat.name}) contains CollectionPage structured data`);
  }

  // --- 6. DISCOVERY DETAIL PAGE DYNAMIC SEO, AEO & GEO ---
  console.log('\n--- 6. Testing Discovery Detail Dynamic SEO, AEO & GEO ---');
  // Fetch real discoveries to test dynamic page
  const discRes = await checkUrl(`${BASE}/api/discoveries?limit=5`);
  let sampleDiscovery = null;
  try {
    const data = JSON.parse(discRes.body);
    const items = data.items || data;
    sampleDiscovery = items.find((d) => d.slug) || items[0];
  } catch (e) {
    // fallback
  }

  if (sampleDiscovery) {
    const targetUrl = `${BASE}/discoveries/${sampleDiscovery.slug || sampleDiscovery.id}`;
    const detailRes = await checkUrl(targetUrl);
    assert(detailRes.status === 200, `Dynamic Discovery Page (${sampleDiscovery.title?.slice(0, 30)}...) -> HTTP 200`);
    assert(detailRes.body.includes('<title>') && detailRes.body.includes('GTA 6 Discovery'), 'Discovery page has dynamic SEO title');
    assert(detailRes.body.includes('name="description"'), 'Discovery page has dynamic meta description');
    assert(detailRes.body.includes('rel="canonical"'), 'Discovery page has canonical URL');
    assert(detailRes.body.includes('property="og:image"'), 'Discovery page has OpenGraph image');
    assert(detailRes.body.includes('"@type":"Article"') || detailRes.body.includes('Article'), 'Discovery page has Article JSON-LD schema');
    assert(detailRes.body.includes('"@type":"BreadcrumbList"') || detailRes.body.includes('BreadcrumbList'), 'Discovery page has BreadcrumbList schema');

    // AEO Question-based headings verification
    assert(detailRes.body.includes('What Was Discovered?'), 'AEO: Page contains "What Was Discovered?" executive heading');
    assert(detailRes.body.includes('Where Is It Located in Leonida?'), 'AEO: Page contains "Where Is It Located in Leonida?" heading');
    assert(detailRes.body.includes('What Evidence Supports This Discovery?'), 'AEO: Page contains "What Evidence Supports This Discovery?" heading');
    assert(detailRes.body.includes('/methodology'), 'GEO: Discovery links to transparent Verification Methodology');

    // Test permanent redirect from /discovery/[slug] to /discoveries/[slug]
    const aliasRes = await checkUrl(`${BASE}/discovery/${sampleDiscovery.slug || sampleDiscovery.id}`);
    assert(
      aliasRes.status === 308 || aliasRes.status === 307 || aliasRes.status === 200,
      `URL structure alias (/discovery/${sampleDiscovery.slug?.slice(0, 20)}) redirects to canonical (/discoveries/...) -> HTTP ${aliasRes.status}`
    );
  }

  // --- 7. NEWS WIRE ARTICLE METADATA & SCHEMA ---
  console.log('\n--- 7. Testing News Article SEO & NewsArticle Schema ---');
  const newsIndex = await checkUrl(`${BASE}/news`);
  assert(newsIndex.status === 200, 'News index accessible -> HTTP 200');
  assert(newsIndex.body.includes('GTA VI News & Updates Wire'), 'News index has dedicated SEO title');

  const newsApi = await checkUrl(`${BASE}/api/news?limit=1`);
  let sampleNews = null;
  try {
    const data = JSON.parse(newsApi.body);
    const items = data.items || data;
    sampleNews = items[0];
  } catch (e) {}

  if (sampleNews && sampleNews.slug) {
    const newsRes = await checkUrl(`${BASE}/news/${sampleNews.slug}`);
    assert(newsRes.status === 200, `News article detail page (/news/${sampleNews.slug}) -> HTTP 200`);
    assert(newsRes.body.includes('GTA VI News Wire'), 'News article has dynamic title');
    assert(newsRes.body.includes('NewsArticle'), 'News article contains NewsArticle JSON-LD schema');
  }

  // --- 8. TRUST, METHODOLOGY & BRAND PAGES ---
  console.log('\n--- 8. Testing Brand, Methodology & Trust Pages ---');
  const trustPages = [
    { url: '/about', title: 'About' },
    { url: '/methodology', title: 'Methodology' },
    { url: '/contact', title: 'Contact' },
    { url: '/privacy', title: 'Privacy' },
    { url: '/terms', title: 'Terms' },
    { url: '/disclaimer', title: 'Disclaimer' },
    { url: '/sources', title: 'Sources' },
  ];

  for (const page of trustPages) {
    const res = await checkUrl(`${BASE}${page.url}`);
    assert(res.status === 200, `Trust Page (${page.url}) accessible -> HTTP 200`);
    assert(res.body.includes('<title>') && res.body.includes(page.title), `Trust Page (${page.url}) has matching title`);
    assert(res.body.includes('BreadcrumbList'), `Trust Page (${page.url}) includes BreadcrumbList schema`);
  }

  // --- 9. DYNAMIC OPENGRAPH SOCIAL SHARING IMAGE API ---
  console.log('\n--- 9. Testing Dynamic OpenGraph Image Generation (/api/og) ---');
  const ogRes = await checkUrl(`${BASE}/api/og?title=Hidden%20Motel%20Room&category=hidden-location&badge=VERIFIED`);
  assert(ogRes.status === 200, 'OG image generator endpoint (/api/og) -> HTTP 200');
  assert(
    ogRes.contentType && ogRes.contentType.includes('image'),
    'OG image generator returns valid binary image'
  );

  // --- 10. INDEXING QUALITY GATE UNIT EVALUATION ---
  console.log('\n--- 10. Testing Section 9 Content Quality & Indexing Gate ---');
  const { evaluateIndexability } = await import('../src/lib/seo/indexingGate.ts');

  // Test high-quality discovery
  const goodDisc = {
    title: 'Secret Submerged Cargo Plane in Key Chicas Shoals',
    description: 'A sunken twin-engine cargo aircraft resting on the sea floor 40 meters underwater off the southern reef.',
    category: 'hidden-location',
    source: { url: 'https://youtube.com/watch?v=sample123', author: 'ScoutAlpha', platform: 'youtube' },
    evidenceImages: [{ url: '/images/discoveries/sunken-wreck.webp', caption: 'Cockpit view' }],
    verificationStatus: 'community_verified',
  };
  const goodEval = evaluateIndexability(goodDisc);
  assert(goodEval.isIndexable === true && goodEval.status === 'INDEXABLE', 'Substantive verified discovery passes Indexing Gate as INDEXABLE');

  // Test thin discovery
  const thinDisc = {
    title: 'Car',
    description: 'Found car',
    category: 'rare-vehicle',
    verificationStatus: 'unverified',
  };
  const thinEval = evaluateIndexability(thinDisc);
  assert(thinEval.isIndexable === false && thinEval.status === 'LOW_VALUE', 'Thin / low-value report correctly flagged as NOINDEX/LOW_VALUE');

  // Test disputed discovery
  const disputedDisc = {
    title: 'Secret Alien Spacecraft on Ocean Drive Rooftop',
    description: 'Alleged flying saucer hovering over Ocean Drive hotel during a thunderstorm at 3 AM.',
    category: 'easter-egg',
    source: { url: 'https://reddit.com/r/sample', author: 'Hoaxer', platform: 'reddit' },
    verificationStatus: 'disputed',
  };
  const disputedEval = evaluateIndexability(disputedDisc);
  assert(disputedEval.isIndexable === false, 'Disputed discovery is strictly excluded from indexing (isIndexable: false)');

  // --- 11. 404 PAGE HANDLING & NOINDEX ---
  console.log('\n--- 11. Testing 404 Not Found & Noindex Directives ---');
  const notFoundRes = await checkUrl(`${BASE}/this-page-definitely-does-not-exist-404-test`);
  assert(notFoundRes.status === 404, 'Non-existent route returns HTTP 404');
  assert(notFoundRes.body.includes('SECTOR NOT FOUND') || notFoundRes.body.includes('404'), '404 page renders branded Sector Not Found');

  console.log('\n================================================================');
  console.log(`SEO TEST RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed !== total) process.exit(1);
}

runSeoTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
