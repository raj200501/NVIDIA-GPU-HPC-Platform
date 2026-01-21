const test = require('node:test');
const assert = require('node:assert');
const { createDataStore } = require('../../demo_services/dataStore');
const { startUserService } = require('../../demo_services/userService');
const { getFreePort } = require('../helpers/ports');
const { requestJson } = require('../helpers/httpClient');

test('user service can create and fetch users', async (t) => {
  const store = createDataStore();
  const port = await getFreePort();
  const server = startUserService(store, port);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const created = await requestJson({
    method: 'POST',
    port,
    path: '/users',
    body: { name: 'Test User', email: 'test@example.com', password: 'secret' },
  });

  assert.strictEqual(created.status, 201);
  assert.strictEqual(created.data.name, 'Test User');

  const fetched = await requestJson({
    method: 'GET',
    port,
    path: `/users/${created.data.id}`,
  });

  assert.strictEqual(fetched.status, 200);
  assert.strictEqual(fetched.data.email, 'test@example.com');
});
