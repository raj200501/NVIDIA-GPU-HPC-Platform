const fs = require('fs');
const os = require('os');
const path = require('path');
const axios = require('axios');
const { startDemoCluster } = require('./demoCluster');

async function runDemo() {
  const isDemo = process.argv.includes('--demo') || process.env.DEMO_MODE === '1';
  if (!isDemo) {
    console.log('Usage: node scripts/demo_mode.js --demo');
    process.exit(1);
  }

  const demoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nvidia-gpu-hpc-demo-'));
  const cluster = await startDemoCluster();
  const api = axios.create({ baseURL: `http://localhost:${cluster.ports.api}/api` });

  try {
    const users = await api.get('/users');
    const registration = await api.post('/auth/register', {
      email: 'demo@example.com',
      password: 'demo',
      name: 'Demo Operator',
    });
    const login = await api.post('/auth/login', {
      email: 'demo@example.com',
      password: 'demo',
    });
    const payment = await api.post('/payments', { userId: registration.data.user.id, amount: 128.0 });
    const notification = await api.post('/notifications', {
      userId: registration.data.user.id,
      message: 'Demo flow completed successfully.',
    });

    const summary = {
      demoDir,
      apiBaseUrl: `http://localhost:${cluster.ports.api}/api`,
      users: users.data,
      registration: registration.data,
      login: login.data,
      payment: payment.data,
      notification: notification.data,
      completedAt: new Date().toISOString(),
    };

    const summaryPath = path.join(demoDir, 'demo-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log('Demo run completed. Summary written to:');
    console.log(summaryPath);
  } catch (error) {
    console.error('Demo run failed:', error.message);
    process.exitCode = 1;
  } finally {
    await cluster.stop();
  }
}

runDemo();
