const axios = require('axios');
const { startDemoCluster } = require('./demoCluster');

async function main() {
  const cluster = await startDemoCluster();
  const api = axios.create({ baseURL: `http://localhost:${cluster.ports.api}/api` });

  try {
    const users = await api.get('/users');
    console.log('Users:', users.data);

    const registration = await api.post('/auth/register', {
      email: 'grace@example.com',
      password: 'analysis',
      name: 'Grace Hopper',
    });
    console.log('Registration:', registration.data);

    const login = await api.post('/auth/login', {
      email: 'grace@example.com',
      password: 'analysis',
    });
    console.log('Login:', login.data);

    const payment = await api.post('/payments', { userId: registration.data.user.id, amount: 42.5 });
    console.log('Payment:', payment.data);

    const notification = await api.post('/notifications', {
      userId: registration.data.user.id,
      message: 'Welcome to the NVIDIA GPU HPC Platform demo!',
    });
    console.log('Notification:', notification.data);

    console.log('\nSmoke test completed successfully.');
  } catch (error) {
    console.error('Smoke test failed:', error.message);
    process.exitCode = 1;
  } finally {
    await cluster.stop();
  }
}

main();
