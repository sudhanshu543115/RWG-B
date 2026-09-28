module.exports = {
  apps: [
    {
      name: "rwg-backend",
      script: "./server.js",
      instances: "max",     // Automatically spawns one process per CPU core
      exec_mode: "cluster", // Balances traffic between all processes
      watch: false,
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
