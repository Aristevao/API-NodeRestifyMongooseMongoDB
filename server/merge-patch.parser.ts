/* Tratamento para usar caminho recomendado para usar o PATCH.
    Usado no HEADER do Postman.
        key: Content-Type, 
        value:  application/merge-patch+json    */

import * as restify from 'restify'

const mpContentType = 'application/merge-patch+json'

export const mergePatchBodyParser = (req: restify.Request, resp: restify.Response, next)=>{
    if(req.getContentType() === mpContentType && req.method === 'PATCH'){
        (<any>req).rawBody = req.body // guarda o body em outra propriedade para usar em outro lugar
        try{
            req.body = JSON.parse(req.body)
        } catch(e){
            return next(new Error(`Invalid content: ${e.message}`))
        }
    }
    return next()
}