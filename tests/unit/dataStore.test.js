const test = require('node:test');
const assert = require('node:assert');
const { createDataStore } = require('../../demo_services/dataStore');

test('data store seeds baseline users', () => {
  const store = createDataStore();
  assert.strictEqual(store.users.length, 2);
  assert.ok(store.users.find((user) => user.email === 'ada@example.com'));
});

test('data store initializes empty collections', () => {
  const store = createDataStore();
  assert.deepStrictEqual(store.payments, []);
  assert.deepStrictEqual(store.notifications, []);
});
