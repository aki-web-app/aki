module.exports = {
  apps: [
    {
      name: 'aki',
      cwd: process.env.AKI_CWD || '/srv/aki',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
    },
  ],
};
