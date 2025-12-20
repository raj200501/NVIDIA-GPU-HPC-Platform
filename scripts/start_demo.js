const { startDemoCluster } = require('./demoCluster');

(async () => {
  const cluster = await startDemoCluster();
  console.log('Demo cluster is running.');
  console.log(`API Gateway: http://localhost:${cluster.ports.api}/api`);
  console.log('Press Ctrl+C to stop.');

  const shutdown = async () => {
    console.log('\nShutting down demo cluster...');
    await cluster.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // keep process alive
  setInterval(() => {}, 1 << 30);
})();
