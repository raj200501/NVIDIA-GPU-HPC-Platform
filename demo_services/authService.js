const express = require('express');
const { createLogger, requestLoggerMiddleware } = require('../observability/logger');
const { createMetrics } = require('../observability/metrics');
const { initOpenTelemetry } = require('../observability/otel');

function startAuthService(store, port = 8081) {
  const app = express();
  app.use(express.json());
  const logger = createLogger({ serviceName: 'auth-service' });
  const metricsEnabled = process.env.ENABLE_METRICS === '1';
  const metrics = metricsEnabled ? createMetrics({ serviceName: 'auth-service' }) : null;
  const healthEnabled = process.env.ENABLE_HEALTH_ENDPOINT === '1';
  const metricsEndpointEnabled = metricsEnabled && process.env.ENABLE_METRICS_ENDPOINT === '1';

  if (logger.enabled) {
    app.use(requestLoggerMiddleware(logger));
  }

  if (metricsEnabled && metrics) {
    app.use(metrics.middleware);
  }

  if (healthEnabled) {
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
    });
  }

  if (metricsEndpointEnabled && metrics) {
    app.get('/metrics', (req, res) => {
      res.json(metrics.snapshot());
    });
  }

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
    if (logger.enabled) {
      logger.info('service_started', { port });
    }
  });

  initOpenTelemetry({ serviceName: 'auth-service' });

  return server;
}

module.exports = { startAuthService };
