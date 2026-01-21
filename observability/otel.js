function initOpenTelemetry({ serviceName = 'service' } = {}) {
  const enabled = process.env.ENABLE_OTEL === '1';
  if (!enabled) {
    return { enabled: false, serviceName };
  }

  const message = `[otel] OpenTelemetry scaffolding enabled for ${serviceName}. No exporters configured.`;
  console.log(message);

  return {
    enabled: true,
    serviceName,
    message,
  };
}

module.exports = { initOpenTelemetry };
