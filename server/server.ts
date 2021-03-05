import * as fs from 'fs'
import * as restify from 'restify'
import * as mongoose from 'mongoose'
import {environment} from '../common/environment'
import {logger} from '../common/logger'
import {Router} from '../common/router'
import {mergePatchBodyParser} from './merge-patch.parser'
import {handleError} from './error.handler'
import {tokenParser} from '../security/token.parser'
export class Server {

    application: restify.Server // Substitui o const Server. Para chama-lo usa-se <this.application>

    // Database
    initializeDb(): mongoose.MongooseThenable { 
        (<any>mongoose).Promise = global.Promise // Usando biblioteca de promise do Node.js |  <any> usado para evitar erro do TypeScript 
        return mongoose.connect(environment.db.url, { // Conecta ao MongoDB na url <mongodb://localhost/meat-api>
          useMongoClient: true // Objeto com propriedades para configurar o modo de conexão 
        })
      }

    initRoutes(routers: Router[ ]): Promise<any>{
        return new Promise((resolve, reject)=>{
        try{

            const options: restify.ServerOptions = {
                name: 'meat-api',
                version: '1.0.0',
                log: logger //  log passado para a instância do servidor
            }

            if(environment.security.enableHTTPS){
            /* Configurações para subir restify com HTTPS
                Por quê? -> http pode ser interceptado, passando infromações como token e credenciais cadastradas. https criptografa essas informações, aumentando a segurança do sistema
                Para isso são usados dois arquivos como base: certificate e key, localizados na pasta ./security/keys
                Quando a aplicação for acessada (https://localhost:3000/users), haverá uma etapa de verificação, dizendo que o site não é seguro pois o certificado não foi gerado por uma unidade certificadora válida. Opção não recomendada para aplicação upada em produção  */
            options.certificate = fs.readFileSync(environment.security.certificate),
            options.key = fs.readFileSync(environment.security.key)
            }
    
            this.application = restify.createServer(options)

            // sempre que chega uma request, é preparado um log específico para essa request. Mas só prepara o log, mas não loga os dados da request. É preciso colocar algumas informações usando esse logger em alguns pontos da aplicação
            this.application.pre(restify.plugins.requestLogger({
                log: logger // log parent
            }))
             
            // Plugins para converter os parâmetros em json
            this.application.use(restify.plugins.queryParser()) 
            this.application.use(restify.plugins.bodyParser())
            this.application.use(mergePatchBodyParser)
            this.application.use(tokenParser)

            // Routes
            for (let router of routers){
                router.applyRoutes(this.application)
            }
            
            this.application.listen(environment.server.port, ()=>{
                resolve(this.application)
            })

            this.application.on('restifyError', handleError)
        /* this.application.on('after', restify.plugins.auditLogger({ // auditLogger -> informa no log o que está acontecendo nas requests. // (req, resp, route, error) ->  callback da assinatura do 'after'. Pode ser usado para criar uma função que limite quais informações serão devolvidas no log pelo 'after'
                log: logger,
                event: 'after',
                server: this.application // indicando a instância do server para liberar opção de usar a função abaixo para limitar as informações exibidas pelo auditLogger
            }))
            
            this.application.on('audit', data=>{ // outra maneira de restringir as informações exibidas pelo auditLogger
            })        */

        }catch(error){
            reject(error)
        }
    })
}

    bootstrap(routers: Router[] = []): Promise<Server>{
        return this.initializeDb().then(()=> // Se houver conexão com o banco de dados -> permite início as rotas
            this.initRoutes(routers).then(()=> this))
    }

    // Desconecta o servidor. Usado para encerrar os testes no afterAll()
    shutdown(){
        return mongoose.disconnect().then(()=>{
            this.application.close
        })
    }

}


