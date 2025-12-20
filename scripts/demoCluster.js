const { createDataStore } = require('../demo_services/dataStore');
const { startUserService } = require('../demo_services/userService');
const { startAuthService } = require('../demo_services/authService');
const { startPaymentService } = require('../demo_services/paymentService');
const { startNotificationService } = require('../demo_services/notificationService');
const { startApiGateway } = require('../api/apiGatewayServer');

async function startDemoCluster(config = {}) {
  const store = createDataStore();
  const ports = {
    user: config.userPort || Number(process.env.USER_SERVICE_PORT) || 8080,
    auth: config.authPort || Number(process.env.AUTH_SERVICE_PORT) || 8081,
    payment: config.paymentPort || Number(process.env.PAYMENT_SERVICE_PORT) || 8082,
    notification: config.notificationPort || Number(process.env.NOTIFICATION_SERVICE_PORT) || 8083,
    api: config.apiPort || Number(process.env.API_GATEWAY_PORT) || 3000,
  };

  const servers = [];
  servers.push(startUserService(store, ports.user));
  servers.push(startAuthService(store, ports.auth));
  servers.push(startPaymentService(store, ports.payment));
  servers.push(startNotificationService(store, ports.notification));
  servers.push(
    startApiGateway({
      port: ports.api,
      userServiceUrl: `http://localhost:${ports.user}`,
      authServiceUrl: `http://localhost:${ports.auth}`,
      paymentServiceUrl: `http://localhost:${ports.payment}`,
      notificationServiceUrl: `http://localhost:${ports.notification}`,
    })
  );

  async function stop() {
    await Promise.all(
      servers.map(
        (server) =>
          new Promise((resolve) => {
            server.close(() => resolve());
          })
      )
    );
  }

  return { stop, ports };
}

module.exports = { startDemoCluster };
