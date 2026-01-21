const test = require('node:test');
const assert = require('node:assert');
const { createDataStore } = require('../../demo_services/dataStore');
const { startNotificationService } = require('../../demo_services/notificationService');
const { getFreePort } = require('../helpers/ports');
const { requestJson } = require('../helpers/httpClient');

test('notification service stores and retrieves notifications', async (t) => {
  const store = createDataStore();
  const port = await getFreePort();
  const server = startNotificationService(store, port);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const created = await requestJson({
    method: 'POST',
    port,
    path: '/notifications',
    body: { userId: 2, message: 'Hello from tests' },
  });

  assert.strictEqual(created.status, 201);
  assert.strictEqual(created.data.userId, 2);

  const list = await requestJson({
    method: 'GET',
    port,
    path: '/notifications/2',
  });

  assert.strictEqual(list.status, 200);
  assert.strictEqual(list.data.length, 1);
});
