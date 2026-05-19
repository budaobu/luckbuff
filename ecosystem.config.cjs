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
      },
    },
  ],
}
