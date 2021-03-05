import * as restify from 'restify'
import {EventEmitter} from 'events'
import {NotFoundError} from 'restify-errors'
export abstract class Router extends EventEmitter {
    abstract applyRoutes(application: restify.Server)

    // Responsável por pegar um documento, pegar todos os dados dele e colocar no envelope
    envelope(document: any): any {
        return document
    }

    envelopeAll(documents: any[], options: any = {}) : any{
        return documents
    }

    /* Função para otimização do código das rotas usdo dentro do <then>
        Trás os documento à tela    */
    render(response: restify.Response, next: restify.Next){
        return(document)=>{
            if(document){
                this.emit('beforeRender', document)
                response.json(this.envelope(document))
            }else{
                throw new NotFoundError ('Documento não encontrado')
            }
            return next(false)
        }
    }

    /* Trás todos os documentos à tela */
    renderAll(response: restify.Response, next: restify.Next, options: any = {}){
        return (documents: any[])=>{
          if(documents){
            documents.forEach((document, index, array)=>{
                this.emit('beforeRender', document)
                array[index] = this.envelope(document)
            })
            response.json(this.envelopeAll(documents, options))
          }else{
                response.json(this.envelopeAll([]))
          }
          return next(false)
        }
    }
}

