const express = require('express');

function startUserService(store, port = 8080) {
  const app = express();
  app.use(express.json());

  app.get('/users', (req, res) => {
    res.json(store.users);
  });

  app.get('/users/:id', (req, res) => {
    const userId = Number(req.params.id);
    const user = store.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });

  app.post('/users', (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    const id = store.users.length ? Math.max(...store.users.map((u) => u.id)) + 1 : 1;
    const newUser = { id, name, email, password };
    store.users.push(newUser);
    res.status(201).json(newUser);
  });

  const server = app.listen(port, () => {
    console.log(`User service running on port ${port}`);
  });

  return server;
}

module.exports = { startUserService };
