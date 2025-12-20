const express = require('express');
const axios = require('axios');

function startApiGateway({
  port = 3000,
  userServiceUrl = 'http://localhost:8080',
  authServiceUrl = 'http://localhost:8081',
  paymentServiceUrl = 'http://localhost:8082',
  notificationServiceUrl = 'http://localhost:8083',
} = {}) {
  const app = express();
  app.use(express.json());

  app.get('/api/users', async (req, res) => {
    try {
      const response = await axios.get(`${userServiceUrl}/users`);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const response = await axios.post(`${authServiceUrl}/auth/login`, req.body);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const response = await axios.post(`${authServiceUrl}/auth/register`, req.body);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/payments', async (req, res) => {
    try {
      const response = await axios.post(`${paymentServiceUrl}/payments`, req.body);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create payment' });
    }
  });

  app.post('/api/notifications', async (req, res) => {
    try {
      const response = await axios.post(`${notificationServiceUrl}/notifications`, req.body);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  const server = app.listen(port, () => {
    console.log(`API Gateway is running on port ${port}`);
  });

  return server;
}

module.exports = { startApiGateway };
