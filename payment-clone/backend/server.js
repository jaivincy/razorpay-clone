const app = require('./app');
const { port, jwtAccessSecret, jwtRefreshSecret, nodeEnv } = require('./config/env');

if (!jwtAccessSecret || !jwtRefreshSecret || jwtAccessSecret.includes('replace_') || jwtRefreshSecret.includes('replace_')) {
  throw new Error('Set strong JWT_ACCESS_SECRET and JWT_REFRESH_SECRET values in .env.');
}

const server = app.listen(port, () => {
  console.log(`PayFlow API listening on port ${port} (${nodeEnv})`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Closing server...`);
  server.close(() => process.exit(0));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));