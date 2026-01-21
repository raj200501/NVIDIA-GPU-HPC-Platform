function calculatePercentile(values, percentile) {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(index, 0)];
}

function createMetrics({ serviceName = 'service' } = {}) {
  const samples = [];

  function record(name, durationMs) {
    samples.push({ name, durationMs, timestamp: new Date().toISOString() });
  }

  function middleware(req, res, next) {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      record(`${req.method} ${req.path}`, durationMs);
    });
    next();
  }

  function snapshot() {
    const durations = samples.map((sample) => sample.durationMs);
    const total = durations.reduce((sum, value) => sum + value, 0);
    const average = durations.length ? total / durations.length : 0;
    return {
      service: serviceName,
      sampleCount: samples.length,
      averageMs: Number(average.toFixed(2)),
      p95Ms: Number(calculatePercentile(durations, 95).toFixed(2)),
      lastSampleAt: samples.length ? samples[samples.length - 1].timestamp : null,
    };
  }

  return {
    record,
    middleware,
    snapshot,
  };
}

module.exports = { createMetrics };
