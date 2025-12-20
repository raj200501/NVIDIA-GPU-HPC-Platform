function createDataStore() {
  const users = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', password: 'computers' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com', password: 'enigma' },
  ];
  const payments = [];
  const notifications = [];
  return { users, payments, notifications };
}

module.exports = { createDataStore };
