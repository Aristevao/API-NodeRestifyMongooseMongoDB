import {ModelRouter} from '../common/model-router'
import * as restify from 'restify'
import {NotFoundError} from 'restify-errors'
import {User} from './users.model'

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
              .then(user => { // removendo erro incoerente ao enviar email inexistente ao DB e substituindo por um array vazio
                  if(user){
                      return [user]
                  }else{
                      return []
                  }
              })
              .then(this.renderAll(resp, next))
              .catch(next)
        }else{
          next()
        }
    }

    applyRoutes(application: restify.Server){
        application.get({path:`${this.basePath}`, version: '2.0.0'}, [this.findByEmail, this.findAll]) // Para definir a versão de filtro, configurar o HEADER como: < value: accept-version, key: 1.0.0 > Também é aceito < key: >1.0.0 >, exibe todos objetos das versões maiores que 1.0.0
        application.get({path:`${this.basePath}`, version: '1.0.0'}, this.findAll)    // Returns json of all users        
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById])    // Return json of a specific user by id defined in URL. Ex: </users/1> returns user with id = 1         
        application.post(`${this.basePath}`, this.save)                                        // Insert a json object in `/users`         
        application.put(`${this.basePath}/:id`, [this.validateId, this.replace])     // Usando rota </users/:id> pois possibilita substituir um objeto por id, caso contrário todos seriam substituídos        
        application.patch(`${this.basePath}/:id`, [this.validateId, this.update])  // Update a object by id        
        application.del(`${this.basePath}/:id`, [this.validateId, this.delete])       // Delete a object by id
    }
}
      

export const usersRouter = new UsersRouter()