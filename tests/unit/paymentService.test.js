const test = require('node:test');
const assert = require('node:assert');
const { createDataStore } = require('../../demo_services/dataStore');
const { startPaymentService } = require('../../demo_services/paymentService');
const { getFreePort } = require('../helpers/ports');
const { requestJson } = require('../helpers/httpClient');

test('payment service records payments', async (t) => {
  const store = createDataStore();
  const port = await getFreePort();
  const server = startPaymentService(store, port);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const payment = await requestJson({
    method: 'POST',
    port,
    path: '/payments',
    body: { userId: 1, amount: 99.5 },
  });

  assert.strictEqual(payment.status, 201);
  assert.strictEqual(payment.data.amount, 99.5);

  const list = await requestJson({
    method: 'GET',
    port,
    path: '/payments',
  });

  assert.strictEqual(list.status, 200);
  assert.strictEqual(list.data.length, 1);
});
