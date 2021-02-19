import {Router} from './router'
import * as mongoose from 'mongoose'
import {NotFoundError} from 'restify-errors'


export abstract class ModelRouter<D extends mongoose.Document> extends Router {
    
    basePath: string

    // Pagination – Define o tamanho limite de documentos que serão carregados de uma vez
    pageSize: number = 4

    constructor(protected model: mongoose.Model<D>){
        super()
        this.basePath = `/${model.collection.name}`
    }

    // Responsável por pegar um documento, pegar todos os dados dele e colocar no envelope. Nesse caso, é adicionado mais um objeto ao dcoumento chamado "_link", exibe o caminho do objeto. Ex: < links: { self: /users/6023fefa251239682e7ecb2f } >
    envelope(document: any) : any {
        let resource = Object.assign( { _links:{ } }, document.toJSON()) // fazendo cópia
        resource._links.self = `${this.basePath}/${resource._id}` //  Definindo a URL. self é o nome dado à URL. Retorno exemplo: < links: { self: /users/6023fefa251239682e7ecb2f } >
        return resource
    }

    envelopeAll(documents: any[], options: any = {}) : any {
        const resource: any = {
            _links: {
                self: `${options.url}` // exibe o path e page atual: < "self": "/users?_page=3" >
            },
            items: documents // exibe array de todos os documentos na respectiva page. < items":[ ] >
        }
        if(options.page){
            if(options.page > 1 && options.count && options.pageSize){
                resource._links.previous = `${this.basePath}?_page=${options.page-1}` // Cria link para retroceder page. < "previous": "/users?_page=2", >
            }
            const remaining = options.count - (options.page * options.pageSize) // Só disponibiliza "next" se houver documentos na próxima page
            if(remaining > 0){
                resource._links.next = `${this.basePath}?_page=${options.page+1}` // Cria link para avançar page. < "next": "/users?_page=4" >
            }
        }
        return resource
    }


    // Valida o id recebido nas rotas através do mongoose
    validateId = (req, resp, next)=>{
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            next(new NotFoundError('Document not found'))
        }else{
            next()
        }
    }

    // Pagination – Encontra os documentos do DB
    findAll = (req, resp, next)=>{
        let page = parseInt(req.query._page || 1)

        page = (page > 0) ? page : 1 // se page > 0 , usar 'page' ; senão usar '1'. Example: < let result = condition ? value1 : value2; > The condition is evaluated: if it’s truthy then value1 is returned, otherwise – value2.

        const skip = (page - 1) * this.pageSize // page que o usuário escolheu x o tamanho da page. Ex: Se pageSize = 4, usuário vai pular 4 registros

        // Count para impedir que seja exibido pages sem documentos
        this.model
        .count({}).exec()
        .then(count=>this.model.find()
                .skip(skip)
                .limit(this.pageSize) // Define o tamanho limite de documentos que serão carregados de uma vez
                .then(this.renderAll(resp,next, {
                        page, count, pageSize: this.pageSize, url: req.url
                })))
        .catch(next)
    }

    findById = (req, resp, next)=>{ // <:id> parâmetro id definido como dinâmico. O valor recebido pelo id vai ser definido pelo <params>
        this.model.findById(req.params.id)
            .then(this.render(resp,next))
            .catch(next) // é o mesmo que --> < .catch(err=>{ next(err) }) >

        /* SEM FUNÇÃO RENDER 
        <req.params.id> pegando o valor  do parâmetro id
        User.findById(req.params.id).then(user=>{
            if(user){ // se o usuário for encontrado, exibí-lo
                resp.json(user)
                return next()
            }
            resp.send(404) // se não for encontrado     
        })      */
    }
    
    save = (req, resp, next)=>{
        let document = new this.model(req.body) // cria um documento vazio no model
        document.save()
            .then(this.render(resp, next))
            .catch(next)
        
        /* SEM FUNÇÃO RENDER 
            Preenchendo as propriedades do documento
            pode ser usado, ex:  <user.name = req.body.name> | <user.email = req.body.email>
            Porém se houver muitos atributos fica ruim. Então pode ser chamado todos de uma vez no model <User(req.body)>
            user.save().then(user=>{
            user.password = undefined // limpa informação da senha para não exibir na response
            resp.json(user)
            return next()
        }) // salva o documento e retorna o objeto usuário  */
    }

    replace = (req, resp, next)=>{
        const options  = {runValidators: true, overwrite: true} // 3° arg do update (oprions) faz com que o conteúdo seja sobrescrito e não atualizado (como PATCH)
        this.model.update({_id:req.params.id}, req.body, options)
            .exec().then(result=>{ // TODO Verificar porque reclama do <result>
              if(result.n){ // verifica se o documento foi encontrado e atualizado
                return this.model.findById(req.params.id)
              }else{
                throw new NotFoundError ('Documento não encontrado') // <resp.send(404)> substituído por <NotFoundError>
              }
        }).then(this.render(resp, next))
    }
    
    update = (req, resp, next)=>{
        const options = {runValidators: true, new: true}
        this.model.findByIdAndUpdate({_id:req.params.id}, req.body, options)
            .then(this.render(resp, next))
            .catch(next)
    }

    delete = (req, resp, next) =>{
        this.model.remove({_id: req.params.id}).exec().then((cmdResult: any)=>{ // <exec> Executes the query. Usado para permitir o uso de promise
            if(cmdResult.result.n){ // Se id foi encontrado e deletado, retornar 204
                resp.send(204)
            }else {
                throw new NotFoundError ('Documento não encontrado')
            }
            return next()
        }).catch(next)
    }
}