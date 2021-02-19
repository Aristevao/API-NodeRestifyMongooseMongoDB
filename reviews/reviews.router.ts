import {ModelRouter} from '../common/model-router'
import * as restify from 'restify'
import * as mongoose from 'mongoose'
import {Review} from './reviews.model'

class ReviewsRouter extends ModelRouter<Review>{
    constructor(){
        super(Review)
    }

    // Cria um objeto a mais para armazenar o link para o menu. Exemplo: < links: { menu": "/restaurants/602d5b0ad13cae50e05607dd/menu" } >
    envelope(document){
        let resource = super.envelope(document)
        const restId = document.restaurant._id ? document.restaurant._id : document.restaurant
        resource._links.restaurants = `/restaurants/${restId}`
        return resource
    }

    protected prepareOne(query: mongoose.DocumentQuery<Review,Review>): mongoose.DocumentQuery<Review,Review>{
        return query.populate('user', 'name')
                    .populate('restaurant', 'name')
      }

    /* Maneira alternativa para o código acima
    findById = (req, resp, next)=>{ // <:id> parâmetro id definido como dinâmico. O valor recebido pelo id vai ser definido pelo <params>
        this.model.findById(req.params.id)
            .populate('user', 'name') // <populate> Ferramenta do mongoose para encontrar e exibir um dado do banco de dados. Nesse caso, o id do user e restaurant. Em bancos relacionais isso não é necessário
            .populate('restaurant') // como em restaurant só há o name com id, não é necessário indicar
            .then(this.render(resp,next))
            .catch(next)
    }*/

    applyRoutes(application: restify.Server){        
        application.get(`${this.basePath}`, this.findAll)                                      // Returns json of all reviews        
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById])    // Return json of a specific user by id defined in URL. Ex: </reviews/1> returns user with id = 1         
        application.post(`${this.basePath}`, this.save)                                        // Insert a json object in '/reviews'         
    }
}
      
export const reviewsRouter = new ReviewsRouter()


