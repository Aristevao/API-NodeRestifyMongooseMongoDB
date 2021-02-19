import * as restify from 'restify'
import * as mongoose from 'mongoose'
import {environment} from '../common/environment'
import {Router} from '../common/router'
import {mergePatchBodyParser} from './merge-patch.parser'
import {handleError} from './error.handler'

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
            this.application = restify.createServer({
                name: 'meat-api',
                version: '1.0.0'
            })
              
            // Plugins para converter os parâmetros em json
            this.application.use(restify.plugins.queryParser()) 
            this.application.use(restify.plugins.bodyParser())
            this.application.use(mergePatchBodyParser)

            // Routes
            for (let router of routers){
                router.applyRoutes(this.application)
            }
            
            this.application.listen(environment.server.port, ()=>{
                resolve(this.application)
            })

            this.application.on('restifyError', handleError)

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


