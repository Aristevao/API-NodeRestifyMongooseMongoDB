module.exports = {
  apps : [{
    name   : "meat-api",
    script : "dist/main.js",
    instances: 0, // sobe o número de processos de acordo com a quantidade de CPUs da máquina. Sobe 1 processo por CPU
    exec_mode: "cluster", // modo. Fork ou Cluster
    merge_logs: true, // indica ao pm2 para juntar todos os logs do processo. Assim, não são criados 1 arquivo por CPU e sim 1 arquivo para todos os CPUs. Esse arquivo fica na raiz do PC, na pasta pm2/logs
    watch: true, // ativa monitoramento em tempo real. Quando o código for salvo, atualiza automaticamente. Substitui o nodemon
    env: { // variáveis de ambiente, do arquivo environment.ts
      SERVER_PORT: 5000,
      DB_URL: 'mongodb://localhost/meat-api',
      NODE_ENV: "development" // modo que o node vai subir
    },
    env_production: {
      SERVER_PORT: 5001,
      NODE_ENV: "production" // como production o node fica mais otimizado
    }
  }]
}
