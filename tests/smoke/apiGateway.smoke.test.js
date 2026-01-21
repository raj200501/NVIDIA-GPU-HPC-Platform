const test = require('node:test');
const assert = require('node:assert');
const { startDemoCluster } = require('../../scripts/demoCluster');
const { getFreePort } = require('../helpers/ports');
const { requestJson } = require('../helpers/httpClient');

test('api gateway routes core demo flow', async (t) => {
  const ports = {
    userPort: await getFreePort(),
    authPort: await getFreePort(),
    paymentPort: await getFreePort(),
    notificationPort: await getFreePort(),
    apiPort: await getFreePort(),
  };

  const cluster = await startDemoCluster(ports);
  t.after(async () => cluster.stop());

  const users = await requestJson({
    method: 'GET',
    port: cluster.ports.api,
    path: '/api/users',
  });

  assert.strictEqual(users.status, 200);
  assert.ok(Array.isArray(users.data));

  const registration = await requestJson({
    method: 'POST',
    port: cluster.ports.api,
    path: '/api/auth/register',
    body: { email: 'smoke@example.com', password: 'smoke', name: 'Smoke Test' },
  });

  assert.strictEqual(registration.status, 200);
  assert.strictEqual(registration.data.user.email, 'smoke@example.com');

  const payment = await requestJson({
    method: 'POST',
    port: cluster.ports.api,
    path: '/api/payments',
    body: { userId: registration.data.user.id, amount: 55.5 },
  });

  assert.strictEqual(payment.status, 200);
  assert.strictEqual(payment.data.amount, 55.5);
});
