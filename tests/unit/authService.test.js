const test = require('node:test');
const assert = require('node:assert');
const { createDataStore } = require('../../demo_services/dataStore');
const { startAuthService } = require('../../demo_services/authService');
const { getFreePort } = require('../helpers/ports');
const { requestJson } = require('../helpers/httpClient');

test('auth service registers and logs in users', async (t) => {
  const store = createDataStore();
  const port = await getFreePort();
  const server = startAuthService(store, port);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const registration = await requestJson({
    method: 'POST',
    port,
    path: '/auth/register',
    body: { email: 'new@example.com', password: 'pass', name: 'New User' },
  });

  assert.strictEqual(registration.status, 201);
  assert.strictEqual(registration.data.user.email, 'new@example.com');

  const login = await requestJson({
    method: 'POST',
    port,
    path: '/auth/login',
    body: { email: 'new@example.com', password: 'pass' },
  });

  assert.strictEqual(login.status, 200);
  assert.strictEqual(login.data.user.name, 'New User');
});

test('auth service rejects duplicate registrations', async (t) => {
  const store = createDataStore();
  const port = await getFreePort();
  const server = startAuthService(store, port);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  await requestJson({
    method: 'POST',
    port,
    path: '/auth/register',
    body: { email: 'dup@example.com', password: 'pass', name: 'Dup User' },
  });

  const duplicate = await requestJson({
    method: 'POST',
    port,
    path: '/auth/register',
    body: { email: 'dup@example.com', password: 'pass', name: 'Dup User' },
  });

  assert.strictEqual(duplicate.status, 409);
  assert.strictEqual(duplicate.data.error, 'User already exists');
});
