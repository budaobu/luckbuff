module.exports = {
  apps: [
    {
      name: 'luckbuff',
      script: '.output/server/index.mjs',
      cwd: '/var/www/luckbuff',
      instances: 1,
      exec_mode: 'fork',
      interpreter: '/home/deploy/.nvm/versions/node/v25.9.0/bin/node',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NODE_PATH: '/var/www/luckbuff/node_modules/.pnpm',
        VEDIC_SERVICE_URL: 'http://127.0.0.1:8765',
      },
    },
    {
      name: 'vedic-service',
      script: '/opt/vedic-service/.venv/bin/uvicorn',
      args: 'main:app --host 127.0.0.1 --port 8765 --workers 2',
      cwd: '/opt/vedic-service',
      interpreter: '/opt/vedic-service/.venv/bin/python',
      env: {
        VEDIC_EPHE_PATH: '/opt/ephe',
      },
    },
  ],
}
