import * as restify from 'restify'
import {ForbiddenError} from 'restify-errors'

/* Garante que só irá avançar se o usuário for autenticado e se for pelo menos um dos profiles esperados  */
export const authorize: (...profiles: string[])=> restify.RequestHandler = (...profiles)=>{
  return (req, resp, next)=>{
    if(req.authenticated !== undefined && req.authenticated.hasAny(...profiles)){ // Argument of type 'string[]' is not assignable to parameter of type 'string'. Para remover esse erro, acrescentar < ... > Ele pega o array profiles e quebra o seu conteúdo, separa por vírgula e passa como argumento dessa função
      req.log.debug('User %s is authorized with profiles %j on route %s. Required profiles %j',
        req.authenticated._id,
        req.authenticated.profiles,
        req.path(),
        profiles)
      next()
  } else {
    if(req.authenticated){
      req.log.debug(
        'Permission denied for %s. Required profiles: %j. User profiles: %j', // %s define a formatação desse documento como string  |  %j define formatação json  |  propriedade log tem as configurações no requestLogger (server.ts)  
          req.authenticated._id,        // parâmetro %s
          profiles,                              // parâmetro %j
          req.authenticated.profiles) // parâmetro %j
    }
    next(new ForbiddenError('Permission denied'))
  }
  }
}

