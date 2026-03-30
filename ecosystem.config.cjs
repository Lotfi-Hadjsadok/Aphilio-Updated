/**
 * PM2 config for production (VPS). Used by CI/CD: pm2 reload ecosystem.config.cjs
 * Requires: npm run build, NODE_ENV=production, .env on the server.
 */
module.exports = {
  apps: [
    {
      name: 'aphilio',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
