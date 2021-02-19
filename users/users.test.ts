import 'jest' // importa funções globais do jest
import * as request from 'supertest'
import {Server} from '../server/server'
import {environment} from '../common/environment'
import {usersRouter} from './users.router'
import {User} from './users.model'

let address: string
let server: Server
beforeAll(()=>{
    environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db' // definindo diferente banco para não polui o de desenvolvimentp
    environment.server.port = process.env.SERVER_PORT || 3001 // porta específica para o ambiente de teste
    address = `http://localhost:${environment.server.port}`
    server = new Server() // iniciando server
    return server.bootstrap([usersRouter]) // return para que o beforeAll acompanhe a inicialização já que há promises e promises são asiíncronas
        .then(()=>{ User.remove({}).exec() }) // limpando os dados dentro da colletion users (por isso do objeto vazio {}). Evitando assim erros de dados repetidos
    .catch(console.error)
})

test('get /users', ()=>{
    return request(address) // request(path) | < return > indica que está sendo esperado a resposta de uma promise
        .get('/users') // .method(route) 
        .then(response=>{ // promise que contem as validações
            expect(response.status).toBe(200) // verifica status code
            expect(response.body.items).toBeInstanceOf(Array) // verificar tipo do items (all documents)
        }).catch(fail) // captura e exibe a falha – se houver
})

test('post /users', ()=>{
    return request(address)
        .post('/users')
        .send({ // Para testar POST é preciso enviar dados com o  < send >
            name: 'usuario1',
            email: 'usuario1@email.com',
            password: '123456',
            cpf: '070.843.150-04'
        })
        .then(response=>{
            // Validando o retorno de cada dado enviado pelo <send>
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.name).toBe('usuario1')
            expect(response.body.email).toBe('usuario1@email.com')
            expect(response.body.password).toBeUndefined() // Password foi criptografada, portanto o retorno dela deve ser undefined
            expect(response.body.cpf).toBe('070.843.150-04')
        }).catch(fail)
})

test('get /users/aaaaa – not found ', ()=>{ // Valida a fução validateId, garantindo que retornará 404 se for inserido url inexistente
    return request(address)
        .get('/users/aaaaa')
        .then(response=>{
            expect(response.status).toBe(404)
        }).catch(fail)
})

test('patch /users/:id', ()=>{
    return request(address)
        .post('/users')
        .send({ // Para testar POST é preciso enviar dados com o  < send >
            name: 'usuario2',
            email: 'usuario2@email.com',
            password: '123456'
        })
        .then(response=>{
            request(address)
            .patch(`/users/${response.body._id}`)
            .send({
                name: 'usuario2 - patch'
            })
        .then(response=>{
            // Validando se o patch foi feito com sucesso
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.name).toBe('usuario2 - patch')
            expect(response.body.email).toBe('usuario2@email.com')
            expect(response.body.password).toBeUndefined()
        })
        }).catch(fail)
})

afterAll(()=>{ // TODO Não funcionando. Teste não encerra na linha de comando
    return server.shutdown() // desconecta o servidor para encerrar o teste. Função criada no arquivo ../server/server
})