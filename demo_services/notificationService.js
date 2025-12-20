const express = require('express');

function startNotificationService(store, port = 8083) {
  const app = express();
  app.use(express.json());

  app.post('/notifications', (req, res) => {
    const { userId, message } = req.body || {};
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }
    const notification = { id: store.notifications.length + 1, userId: Number(userId), message };
    store.notifications.push(notification);
    res.status(201).json(notification);
  });

  app.get('/notifications/:userId', (req, res) => {
    const userId = Number(req.params.userId);
    const results = store.notifications.filter((note) => note.userId === userId);
    res.json(results);
  });

  const server = app.listen(port, () => {
    console.log(`Notification service running on port ${port}`);
  });

  return server;
}

module.exports = { startNotificationService };
