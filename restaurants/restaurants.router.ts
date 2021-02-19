import {ModelRouter} from '../common/model-router'
import * as restify from 'restify'
import {NotFoundError} from 'restify-errors'
import {Restaurant} from './restaurants.model'

class RestaurantsRouter extends ModelRouter<Restaurant> {
    constructor(){
        super(Restaurant)
    }

    // Cria um objeto a mais para armazenar o link para o menu. Exemplo: < links: { menu": "/restaurants/602d5b0ad13cae50e05607dd/menu" } >
    envelope(document){
      let resource = super.envelope(document)
      resource._links.menu = `${this.basePath}/${resource._id}/menu`
      return resource
    }

    findMenu = (req, resp, next) => {
        Restaurant.findById(req.params.id, "+menu") // < +menu > permite ser exibido o item determinado como < select > em model
            .then(rest =>{
                if(!rest){
                throw new NotFoundError('Restaurant not found')
                }else{
                resp.json(rest.menu)
                return next()
                }
            }).catch(next)
    }

    replaceMenu = (req, resp, next)=>{
        Restaurant.findById(req.params.id).then(rest=>{
          if(!rest){
            throw new NotFoundError('Restaurant not found')
          }else{
            rest.menu = req.body //ARRAY de MenuItem
            return rest.save()
          }
        }).then(rest=>{
          resp.json(rest.menu)
          return next()
        }).catch(next)
    }

    applyRoutes(application: restify.Server){
        application.get(`${this.basePath}`, this.findAll)                                      // Returns json of all users        
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById])    // Return json of a specific user by id defined in URL. Ex: </users/1> returns user with id = 1         
        application.post(`${this.basePath}`, this.save)                                        // Insert a json object in '/users'         
        application.put(`${this.basePath}/:id`, [this.validateId,this.replace])     // Usando rota </users/:id> pois possibilita substituir um objeto por id, caso contrário todos seriam substituídos        
        application.patch(`${this.basePath}/:id`, [this.validateId,this.update])  // Update a object by id        
        application.del(`${this.basePath}/:id`, [this.validateId,this.delete])       // Delete a object by id

        application.get(`${this.basePath}/:id/menu`, [this.validateId, this.findMenu]) // Returns json of all menu from a specific restaurants id
        application.put(`${this.basePath}/:id/menu`, [this.validateId, this.replaceMenu])
    }
}
      

export const restaurantsRouter = new RestaurantsRouter()