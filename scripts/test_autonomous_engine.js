const http = require('http');

function checkUrl(url, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 35000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => resolve({ status: 'ERR', message: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'TIMEOUT' });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTest() {
  console.log('================================================================');
  console.log('VICEPULSE AUTONOMOUS GTA VI RESEARCH ENGINE VERIFICATION');
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

  // 1. Check Autonomous Status Endpoint
  const statusRes = await checkUrl('http://127.0.0.1:3000/api/autonomous/status');
  assert(statusRes.status === 200, 'Autonomous Status API (/api/autonomous/status) -> HTTP 200');
  assert(statusRes.body?.success === true, 'Status response success: true');
  
  const statusData = statusRes.body?.data;
  assert(Array.isArray(statusData?.connectorStatuses), 'Connector status matrix reported');
  assert(statusData?.connectorStatuses?.length >= 4, `All 4 connectors present (${statusData?.connectorStatuses?.length} found)`);

  // Verify YouTube, Reddit, RSS, Social connectors
  const platforms = statusData?.connectorStatuses?.map(c => c.platform) || [];
  assert(platforms.includes('youtube'), 'YouTube Connector active in matrix');
  assert(platforms.includes('reddit'), 'Reddit Connector active in matrix');
  assert(platforms.includes('gaming-press') || platforms.includes('rss'), 'RSS Gaming Press Connector active in matrix');
  assert(platforms.includes('x-twitter'), 'Social Media Recon Connector active in matrix');

  // 2. Check Autonomous Config Endpoint
  const configRes = await checkUrl('http://127.0.0.1:3000/api/autonomous/config');
  assert(configRes.status === 200, 'Autonomous Config API (/api/autonomous/config) -> HTTP 200');
  assert(configRes.body?.success === true, 'Config API returns success: true');
  assert(typeof configRes.body?.data?.discoverySearchIntervalHours === 'number', 'Configurable discovery interval hours verified');
  assert(typeof configRes.body?.data?.dailyBudgetCapUSD === 'number', 'Daily budget cap configuration verified');

  // 3. Check Research Queries Endpoint (GET & POST)
  const queriesRes = await checkUrl('http://127.0.0.1:3000/api/autonomous/queries');
  assert(queriesRes.status === 200, 'Research Queries API (/api/autonomous/queries) -> HTTP 200');
  assert(Array.isArray(queriesRes.body?.data), 'Research queries array returned');

  // Inject a query
  const testQuery = `GTA VI secret swamp airfield test ${Date.now()}`;
  const addQueryRes = await checkUrl('http://127.0.0.1:3000/api/autonomous/queries', 'POST', {
    query: testQuery,
    category: 'hidden-location',
    priority: 'high',
  });
  assert(addQueryRes.status === 200, 'Inject research query via API -> HTTP 200');
  assert(addQueryRes.body?.data?.query === testQuery, 'Injected query persisted in MongoDB');

  // Delete injected query cleanup
  if (addQueryRes.body?.data?._id) {
    const delRes = await checkUrl(`http://127.0.0.1:3000/api/autonomous/queries?id=${addQueryRes.body.data._id}`, 'DELETE');
    assert(delRes.status === 200, 'Delete research query cleanup -> HTTP 200');
  }

  // 4. Trigger Autonomous Recon Sweep
  console.log('\n--- Triggering Autonomous Recon Sweep Pipeline ---');
  const runRes = await checkUrl('http://127.0.0.1:3000/api/autonomous/run', 'POST', { trigger: 'manual' });
  assert(runRes.status === 200, 'Execute Autonomous Pipeline (/api/autonomous/run) -> HTTP 200');
  assert(runRes.body?.success === true, 'Pipeline completed successfully with status: true');

  const pipeData = runRes.body?.data;
  assert(pipeData?.sourcesChecked >= 3, `Monitored sources queried (${pipeData?.sourcesChecked} sources)`);
  assert(pipeData?.itemsIngested > 0, `Items ingested across connectors (${pipeData?.itemsIngested} items)`);
  assert(typeof pipeData?.discoveriesCreated === 'number', `Discoveries created counter (${pipeData?.discoveriesCreated} new)`);
  assert(typeof pipeData?.discoveriesUpdated === 'number', `Discoveries corroborated/merged counter (${pipeData?.discoveriesUpdated} updated)`);
  assert(typeof pipeData?.durationMs === 'number' && pipeData.durationMs > 0, `Pipeline duration recorded (${pipeData?.durationMs}ms)`);

  // 5. Verify Database Records
  const discRes = await checkUrl('http://127.0.0.1:3000/api/discoveries');
  assert(discRes.status === 200, 'Discoveries API accessible -> HTTP 200');
  const discItems = discRes.body?.items || [];
  assert(discItems.length > 0, `Discoveries indexed in database (${discItems.length} total)`);

  // Verify that discoveries with no coordinates do NOT have fake coordinates
  let fakeCoordinatesFound = 0;
  discItems.forEach(d => {
    if (d.coordinates?.inGameGrid === 'LOCATION_PENDING' && (d.coordinates?.lat !== 0 || d.coordinates?.lng !== 0)) {
      fakeCoordinatesFound++;
    }
  });
  assert(fakeCoordinatesFound === 0, 'Zero discoveries with fabricated coordinates (Strict Section 9 Compliance)');

  // 6. Verify Admin Dashboard (/admin)
  const adminPage = await checkUrl('http://127.0.0.1:3000/admin');
  assert(adminPage.status === 200, 'Admin Intelligence Dashboard (/admin) accessible -> HTTP 200');

  console.log('\n================================================================');
  console.log(`AUTONOMOUS RESEARCH ENGINE RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed !== total) process.exit(1);
}

runTest().catch((e) => {
  console.error(e);
  process.exit(1);
});
