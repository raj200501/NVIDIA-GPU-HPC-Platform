const express = require('express');
const { createLogger, requestLoggerMiddleware } = require('../observability/logger');
const { createMetrics } = require('../observability/metrics');
const { initOpenTelemetry } = require('../observability/otel');

function startNotificationService(store, port = 8083) {
  const app = express();
  app.use(express.json());
  const logger = createLogger({ serviceName: 'notification-service' });
  const metricsEnabled = process.env.ENABLE_METRICS === '1';
  const metrics = metricsEnabled ? createMetrics({ serviceName: 'notification-service' }) : null;
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
      res.json({ status: 'ok', service: 'notification-service', timestamp: new Date().toISOString() });
    });
  }

  if (metricsEndpointEnabled && metrics) {
    app.get('/metrics', (req, res) => {
      res.json(metrics.snapshot());
    });
  }

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
    if (logger.enabled) {
      logger.info('service_started', { port });
    }
  });

  initOpenTelemetry({ serviceName: 'notification-service' });

  return server;
}

module.exports = { startNotificationService };
