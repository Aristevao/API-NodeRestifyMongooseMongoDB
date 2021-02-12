/* Se o valor SERVER_PORT não for setado, 3000 será usado
    Se o valor DB_URL não for setado, 'mongodb://localhost/meat-api' será usado */
export const environment = {
    server: { port: process.env.SERVER_PORT || 3000 },
    db: {url: process.env.DB_URL || 'mongodb://localhost/meat-api'}
}