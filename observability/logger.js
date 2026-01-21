const DEFAULT_LEVEL = 'info';

function formatLogLine({ timestamp, level, service, message, meta, json }) {
  const payload = {
    timestamp,
    level,
    service,
    message,
  };

  if (meta && Object.keys(meta).length) {
    payload.meta = meta;
  }

  if (json) {
    return JSON.stringify(payload);
  }

  const metaSuffix = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] [${service}] ${message}${metaSuffix}`;
}

function createLogger({ serviceName = 'service', enableStructured, json } = {}) {
  const structured = enableStructured ?? process.env.ENABLE_STRUCTURED_LOGS === '1';
  const jsonEnabled = json ?? process.env.LOG_FORMAT === 'json';
  const enabled = structured || jsonEnabled;

  function log(level, message, meta = {}) {
    if (!enabled) {
      return;
    }
    const timestamp = new Date().toISOString();
    const line = formatLogLine({
      timestamp,
      level,
      service: serviceName,
      message,
      meta,
      json: jsonEnabled,
    });

    if (level === 'error') {
      console.error(line);
    } else {
      console.log(line);
    }
  }

  return {
    enabled,
    serviceName,
    level: DEFAULT_LEVEL,
    log,
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
  };
}

function requestLoggerMiddleware(logger) {
  return (req, res, next) => {
    if (!logger || !logger.enabled) {
      return next();
    }
    const startedAt = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      logger.info('http_request', {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs,
      });
    });
    next();
  };
}

module.exports = {
  createLogger,
  requestLoggerMiddleware,
};
