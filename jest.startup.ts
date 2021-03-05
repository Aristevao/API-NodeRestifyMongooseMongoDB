/* Arquivo para configurar ambiente de teste padrão com Jest.
    O beforeAll() e afterAll() são usados em todos os caminhos de teste, com isso, para não precisar duplicar várias vezes é usado uma estratégia.
    Porém, essa estratégia é em JavaScript, como a programação está sendo feita em TypeScript é usado uma biblioteca para evitar trabalhar com mais de uma linguagem.
    npm i ts-node@5.0.1 jest-cli@22.4.2 -D -E*/

import * as jestCli from 'jest-cli'
import {Server} from './server/server'
import {environment} from './common/environment'
import {usersRouter} from './users/users.router'
import {reviewsRouter} from './reviews/reviews.router'
import {restaurantsRouter} from './restaurants/restaurants.router'
import {User} from './users/users.model'
import { Review } from './reviews/reviews.model'
import {Restaurant} from './restaurants/restaurants.model'

let server: Server
const beforeAllTests = ()=>{
    environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db' // definindo diferente banco para não polui o de desenvolvimentp
    environment.server.port = process.env.SERVER_PORT || 3001 // porta específica para o ambiente de teste
    server = new Server() // iniciando server
    return server.bootstrap([
        usersRouter,
        reviewsRouter,
        restaurantsRouter
    ]) // return para que o beforeAll acompanhe a inicialização já que há promises e promises são asiíncronas
        .then(()=>{ User.remove({}).exec() }) // limpando os dados dentro da colletion users (por isso do objeto vazio {}). Evitando assim erros de dados repetidos
        .then(()=>{ // Configuração de usuário padrão de teste. O token dele foi definido no package.json, em adress
            let admin = new User()
            admin.name = 'admin'
            admin.email = 'admin@email.com'
            admin.password = '1234567'
            admin.profiles = ['admin', 'user']
            return admin.save()
          })
        .then(()=>{ Review.remove({}).exec() })
        .then(()=>Restaurant.remove({}).exec())
}

const afterAllTests = ()=>{ // TODO Não funcionando. Teste não encerra na linha de comando
    return server.shutdown()  // desconecta o servidor para encerrar o teste. Função criada no arquivo ../server/server
}

beforeAllTests() // Inicializa servidor
.then(()=>{ jestCli.run() }) // inicializa jestCli. Procura pelos testes e os executa
.then(()=>{ afterAllTests() }) // desconecta o servidor para encerrar o teste. Função criada no arquivo ../server/server
.catch(console.error) // exibe erro se houver