const express = require('express');

function startPaymentService(store, port = 8082) {
  const app = express();
  app.use(express.json());

  app.get('/payments', (req, res) => {
    res.json(store.payments);
  });

  app.post('/payments', (req, res) => {
    const { userId, amount } = req.body || {};
    if (!userId || typeof amount !== 'number') {
      return res.status(400).json({ error: 'userId and amount are required' });
    }
    const payment = { id: store.payments.length + 1, userId, amount };
    store.payments.push(payment);
    res.status(201).json(payment);
  });

  const server = app.listen(port, () => {
    console.log(`Payment service running on port ${port}`);
  });

  return server;
}

module.exports = { startPaymentService };
