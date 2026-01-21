const express = require('express');
const { createLogger, requestLoggerMiddleware } = require('../observability/logger');
const { createMetrics } = require('../observability/metrics');
const { initOpenTelemetry } = require('../observability/otel');

function startPaymentService(store, port = 8082) {
  const app = express();
  app.use(express.json());
  const logger = createLogger({ serviceName: 'payment-service' });
  const metricsEnabled = process.env.ENABLE_METRICS === '1';
  const metrics = metricsEnabled ? createMetrics({ serviceName: 'payment-service' }) : null;
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
      res.json({ status: 'ok', service: 'payment-service', timestamp: new Date().toISOString() });
    });
  }

  if (metricsEndpointEnabled && metrics) {
    app.get('/metrics', (req, res) => {
      res.json(metrics.snapshot());
    });
  }

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
    if (logger.enabled) {
      logger.info('service_started', { port });
    }
  });

  initOpenTelemetry({ serviceName: 'payment-service' });

  return server;
}

module.exports = { startPaymentService };
