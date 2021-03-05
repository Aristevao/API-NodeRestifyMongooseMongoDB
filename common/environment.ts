/* process.env -> variável de ambiente

    Se o valor SERVER_PORT não for setado, 3000 será usado
    Se o valor DB_URL não for setado, 'mongodb://localhost/meat-api' será usado
    Se o valor SALT_ROUNDS não for setado, 10 será usado
    Se o valor API_SECRET não for setado, meat-api-secret será usado - assinatura do token
*/
export const environment = {
    server: { port: process.env.SERVER_PORT || 3000 },
    db: {url: process.env.DB_URL || 'mongodb://localhost/meat-api'},
    security: {
      saltRounds: process.env.SALT_ROUNDS || 10,
      apiSecret: process.env.API_SECERT || 'meat-api-secret',
      enableHTTPS: process.env.ENABLE_HTTPS || false,
      certificate: process.env.CERTI_FILE || './security/keys/cert.pem',
      key: process.env.CERT_KEY_FILE || './security/keys/key.pem'
    },
    log: {
      level: process.env.LOG_LEVEL || 'debug',
      name: 'meat-api-logger'
    }
  }  