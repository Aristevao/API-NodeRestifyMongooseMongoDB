import {Router} from '../common/router'
import * as restify from 'restify'
import {User} from './users.model'

// Routes
class UsersRouter extends Router {
    applyRoutes(application: restify.Server){

        // Returns json of all users
        application.get('/users', (req, resp, next)=> {
            User.find().then(users=>{
                resp.json(users)
                return next()
            })
        })

        // Return json of a specific user by id defined in URL. Ex: </users/1> returns user with id = 1 
        application.get('/users/:id', (req, resp, next)=>{ // <:id> parâmetro id definido como dinâmico. O valor recebido pelo id vai ser definido pelo <params>
            User.findById(req.params.id).then(user=>{ // <req.params.id> pegando o valor  do parâmetro do id
                if(user){ // se o usuário for encontrado, exibí-lo
                    resp.json(user)
                    return next()
                }
                resp.send(404) // se não for encontrado
                
            })
        })

        application.post('/users', (req, resp, next)=>{
            let user = new User(req.body) // cria um documento vazio no model

            /* Preenchendo as propriedades do documento
                pode ser usado, ex:  <user.name = req.body.name> | <user.email = req.body.email>
                Porém se houver muitos atributos fica ruim. Então pode ser chamado todos de uma vez no model <User(req.body)> */
                
            user.save().then(user=>{
                user.password = undefined // limpa informação da senha para não exibir na response
                resp.json(user)
                return next()
            }) // salva o documento e retorna o objeto usuário
        })

         // usando rota </users/:id> pois possibilita substituir um objeto por id, caso contrário todos seriam substituídos
         application.put('/users/:id', (req, resp, next)=>{
            const options  = {overwrite: true} // 3° arg do <update> faz com que o conteúdo seja sobrescrito e não atualizado (como PATCH)
            User.update({_id:req.params.id}, req.body, options)
                .exec().then(result =>{ // TODO Verificar porque reclama do <result>
                  if(result.n){ // verifica se o documento foi encontrado e atualizado
                    return User.findById(req.params.id)
                  }else{
                    resp.send(404)
                  }
            }).then(user=>{
              resp.json(user)
              return next()
            })
          })

        application.patch('/users/:id', (req, resp, next)=>{
            const options = {new: true}
            User.findByIdAndUpdate({_id:req.params.id}, req.body, options).then(user=>{
                if(user){
                    resp.json(user)
                    return next()
                }
                resp.send(404)
                return next()
            })
        })
    }
}
      

export const usersRouter = new UsersRouter()