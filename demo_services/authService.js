const express = require('express');

function startAuthService(store, port = 8081) {
  const app = express();
  app.use(express.json());

  app.post('/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    const user = store.users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name } });
  });

  app.post('/auth/register', (req, res) => {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, and name are required' });
    }
    const existing = store.users.find((u) => u.email === email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const id = store.users.length ? Math.max(...store.users.map((u) => u.id)) + 1 : 1;
    const user = { id, email, password, name };
    store.users.push(user);
    res.status(201).json({ message: 'Registration successful', user: { id: user.id, email: user.email, name: user.name } });
  });

  const server = app.listen(port, () => {
    console.log(`Auth service running on port ${port}`);
  });

  return server;
}

module.exports = { startAuthService };
