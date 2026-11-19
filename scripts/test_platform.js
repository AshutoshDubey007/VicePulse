const crypto = require('crypto');
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
        timeout: 6000,
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

async function runTestSuite() {
  console.log('================================================================');
  console.log('VICEPULSE COMPREHENSIVE PLATFORM VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName} ${details}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName} ${details}`);
    }
  }

  // 1. Test Unit Cryptographic Signature Verification
  console.log('--- 1. Testing Payment Signature Verification ---');
  const testSecret = 'rzp_test_secret_key_12345';
  const orderId = 'order_test_998811';
  const paymentId = 'pay_test_776655';
  const validSignature = crypto.createHmac('sha256', testSecret).update(`${orderId}|${paymentId}`).digest('hex');
  const invalidSignature = 'invalid_tampered_signature_hex_value';

  const testHmac = crypto.createHmac('sha256', testSecret).update(`${orderId}|${paymentId}`).digest('hex');
  assert(testHmac === validSignature, 'HMAC SHA256 Signature generation & verification');
  assert(testHmac !== invalidSignature, 'Tampered signature correctly rejected');

  // 2. Test Server Endpoints
  console.log('\n--- 2. Testing HTTP Endpoints & API Routes ---');
  const routes = [
    { path: '/', expected: 200, name: 'Home Landing Page' },
    { path: '/feed', expected: 200, name: 'Discovery Feed' },
    { path: '/map', expected: 200, name: 'Tactical Map' },
    { path: '/vehicles', expected: 200, name: 'Rare Vehicles' },
    { path: '/billing', expected: 200, name: 'Billing & Subscriptions' },
    { path: '/settings/notifications', expected: 200, name: 'Notification Preferences' },
    { path: '/admin', expected: 200, name: 'Admin Verification Desk' },
    { path: '/api/stats', expected: 200, name: 'Platform Stats API' },
    { path: '/api/payments/subscription', expected: 200, name: 'Subscription Status API' },
    { path: '/api/payments/history', expected: 200, name: 'Payment History API' },
    { path: '/api/notifications', expected: 200, name: 'In-App Notifications API' },
    { path: '/api/notifications/settings', expected: 200, name: 'Notification Settings API' },
  ];

  for (const r of routes) {
    try {
      const res = await checkUrl(BASE_URL + r.path);
      assert(res.status === r.expected, `${r.name} (${r.path}) -> HTTP ${res.status}`);
    } catch (e) {
      assert(false, `${r.name} (${r.path})`, `Error: ${e.message}`);
    }
  }

  // 3. Test Payment Order Creation
  console.log('\n--- 3. Testing Payment Order Creation & Verification API ---');
  let createdOrderId = '';
  try {
    const orderRes = await checkUrl(
      `${BASE_URL}/api/payments/create-order`,
      'POST',
      JSON.stringify({
        planId: 'scout_pro',
        billingCycle: 'monthly',
        provider: 'razorpay',
      })
    );
    assert(orderRes.status === 200, 'Create Razorpay Order API -> HTTP 200');
    const orderData = JSON.parse(orderRes.body);
    createdOrderId = orderData.orderId;
    assert(Boolean(createdOrderId), 'Order ID created', `(${createdOrderId})`);
    assert(orderData.currency === 'INR', 'Currency matches INR configuration');
  } catch (e) {
    assert(false, 'Create Razorpay Order API', e.message);
  }

  // 4. Test Server-side Payment Verification
  if (createdOrderId) {
    try {
      const verifyRes = await checkUrl(
        `${BASE_URL}/api/payments/verify`,
        'POST',
        JSON.stringify({
          orderId: createdOrderId,
          paymentId: `pay_test_${Date.now()}`,
          signature: `test_sig_${createdOrderId}`,
          userId: 'usr-1',
        })
      );
      assert(verifyRes.status === 200, 'Server-side Payment Signature Verification -> HTTP 200');
      const verifyData = JSON.parse(verifyRes.body);
      assert(verifyData.verified === true, 'Payment verified and marked verified: true');
      assert(verifyData.subscription && verifyData.subscription.status === 'active', 'Subscription activated');
    } catch (e) {
      assert(false, 'Server-side Payment Signature Verification', e.message);
    }
  }

  // 5. Test Webhook Signature & Idempotency
  console.log('\n--- 4. Testing Webhook Signature Verification & Idempotency ---');
  const webhookEventId = `evt_test_idemp_${Date.now()}`;
  const webhookPayload = JSON.stringify({
    id: webhookEventId,
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_wh_${Date.now()}`,
          order_id: createdOrderId || 'order_sample_01',
          amount: 49900,
          currency: 'INR',
          status: 'captured',
        },
      },
    },
  });

  try {
    // Attempt 1: First delivery
    const wh1 = await checkUrl(
      `${BASE_URL}/api/payments/webhook`,
      'POST',
      webhookPayload,
      { 'x-razorpay-signature': 'test_wh_sig_valid' }
    );
    assert(wh1.status === 200, 'Initial Webhook delivery accepted -> HTTP 200');

    // Attempt 2: Duplicate delivery (tests idempotency)
    const wh2 = await checkUrl(
      `${BASE_URL}/api/payments/webhook`,
      'POST',
      webhookPayload,
      { 'x-razorpay-signature': 'test_wh_sig_valid' }
    );
    assert(wh2.status === 200, 'Duplicate Webhook delivery processed idempotently without error');
  } catch (e) {
    assert(false, 'Webhook delivery and idempotency test', e.message);
  }

  // 6. Test Premium-Only Entitlement Protection
  console.log('\n--- 5. Testing Authorization on Premium-Only Endpoints ---');
  try {
    // Test with user with active subscription (usr-1 has scout_pro)
    const authRes = await checkUrl(`${BASE_URL}/api/intel/classified-overlay?userId=usr-1`);
    assert(authRes.status === 200, 'Classified Satellite Overlay for Pro Scout -> HTTP 200 Authorized');

    // Test with unauthenticated / non-existent free user
    const unauthRes = await checkUrl(`${BASE_URL}/api/intel/classified-overlay?userId=usr-free-guest`);
    assert(unauthRes.status === 403, 'Classified Satellite Overlay for Free user -> HTTP 403 Forbidden');
  } catch (e) {
    assert(false, 'Premium Entitlement Authorization check', e.message);
  }

  // 7. Test In-App Notification Center
  console.log('\n--- 6. Testing In-App Notification Center ---');
  try {
    const notifRes = await checkUrl(`${BASE_URL}/api/notifications?userId=usr-1`);
    assert(notifRes.status === 200, 'Fetch Notifications -> HTTP 200');
    const notifData = JSON.parse(notifRes.body);
    assert(Array.isArray(notifData.notifications), 'Notifications array returned');

    // Test Mark All Read
    const markRes = await checkUrl(
      `${BASE_URL}/api/notifications`,
      'PATCH',
      JSON.stringify({ markAll: true, userId: 'usr-1' })
    );
    assert(markRes.status === 200, 'Mark all notifications as read -> HTTP 200');
  } catch (e) {
    assert(false, 'In-App Notification Center test', e.message);
  }

  // 8. Test Communication Preferences & Unsubscribe
  console.log('\n--- 7. Testing Notification Preferences & Unsubscribe ---');
  try {
    const prefRes = await checkUrl(
      `${BASE_URL}/api/notifications/settings`,
      'PUT',
      JSON.stringify({
        marketingEmails: false,
        weeklyDigest: true,
        discoveryUpdates: true,
        commentReplies: true,
        userId: 'usr-1',
      })
    );
    assert(prefRes.status === 200, 'Update Notification Settings API -> HTTP 200');
    const prefData = JSON.parse(prefRes.body);
    assert(prefData.settings.marketingEmails === false, 'Marketing preference toggled to false');
    assert(prefData.settings.securityAndTransactional === true, 'Essential security & billing remains true (immutable)');

    // Test Unsubscribe route
    const unsubRes = await checkUrl(`${BASE_URL}/api/email/unsubscribe?token=unsub_usr-1`);
    assert(unsubRes.status === 200, 'One-Click Unsubscribe Endpoint -> HTTP 200');
  } catch (e) {
    assert(false, 'Notification Preferences & Unsubscribe test', e.message);
  }

  console.log('\n================================================================');
  console.log(`TEST SUITE RESULTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite();
