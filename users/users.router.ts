import {ModelRouter} from '../common/model-router'
import * as restify from 'restify'
import {NotFoundError} from 'restify-errors'
import {User} from './users.model'
import {authenticate} from '../security/auth.handler'
import {authorize} from '../security/authz.handler'

// Routes
class UsersRouter extends ModelRouter<User> {

    constructor(){ // The constructor method is a special method of a class for creating and initializing an object of that class.
        super(User) // TypeScript exige constructor da classe base. Obrigatório
        this.on('beforeRender', document=>{
            document.password = undefined // ou <delete document.password>
        })
    }

    // Encontrar objeto por email na query. Ex: http://localhost:3000/users?"email": "peter@marvel.com"
    findByEmail = (req, resp, next)=>{
        if(req.query.email){
          User.findByEmail(req.query.email) // usando método findByEmail criado no ./users.model
              .then(user => user ? [user] : []) // removendo erro incoerente ao enviar email inexistente ao DB e substituindo por um array vazio
              .then(this.renderAll(resp, next, {
                    pageSize: this.pageSize,
                    url: req.url
                  }))
              .catch(next)
        }else{
          next()
        }
      }

      // TODO Aplicar authorize("admin") para todas as rotas, exceto authenticate. Não feita ainda porque autenticação não funcionando corretamente. Aula 56
    applyRoutes(application: restify.Server){  // Para definir a versão de filtro, configurar o HEADER como: < value: accept-version, key: 1.0.0 > Também é aceito < key: >1.0.0 >, exibe todos objetos das versões maiores que 1.0.0
        application.get({path:`${this.basePath}`, version: '2.0.0'}, [
          authorize('admin'), // restringe essa rota somente a admins
          this.findByEmail,
          this.findAll]) 
        application.get({path:`${this.basePath}`, version: '1.0.0'},[authorize('admin'), this.findAll])  // Returns json of all users        
        application.get(`${this.basePath}/:id`, [this.validateId, authorize('admin'),this.findById])    // Return json of a specific user by id defined in URL. Ex: </users/1> returns user with id = 1         
        application.post(`${this.basePath}`, [authorize('admin'), this.save])                                     // Insert a json object in `/users`      
        /* As rotas PUT e PATCH estão restritas somente à admin, impedindo o usuário alterar os próprios dados
            Parar permitir admin e user, implementar: authorize('admin', 'user')
            E na frente (vírgula após authorize) inseir validação: id que está querendo editar pertence ao id do usuário logado (id da rota)? E identificar se é admin ou user   */   
        application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace])     // Usando rota </users/:id> pois possibilita substituir um objeto por id, caso contrário todos seriam substituídos        
        application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update])  // Update a object by id        
        application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])       // Delete a object by id

        application.post(`${this.basePath}/authenticate`, authenticate) // rota para gerar token
    }
}
      

export const usersRouter = new UsersRouter()