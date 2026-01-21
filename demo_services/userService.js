const express = require('express');
const { createLogger, requestLoggerMiddleware } = require('../observability/logger');
const { createMetrics } = require('../observability/metrics');
const { initOpenTelemetry } = require('../observability/otel');

function startUserService(store, port = 8080) {
  const app = express();
  app.use(express.json());
  const logger = createLogger({ serviceName: 'user-service' });
  const metricsEnabled = process.env.ENABLE_METRICS === '1';
  const metrics = metricsEnabled ? createMetrics({ serviceName: 'user-service' }) : null;
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
      res.json({ status: 'ok', service: 'user-service', timestamp: new Date().toISOString() });
    });
  }

  if (metricsEndpointEnabled && metrics) {
    app.get('/metrics', (req, res) => {
      res.json(metrics.snapshot());
    });
  }

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
    if (logger.enabled) {
      logger.info('service_started', { port });
    }
  });

  initOpenTelemetry({ serviceName: 'user-service' });

  return server;
}

module.exports = { startUserService };
