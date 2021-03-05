import * as restify from 'restify'
import * as jwt from 'jsonwebtoken'
import {NotAuthorizedError} from 'restify-errors'
import {User} from '../users/users.model'
import {environment} from '../common/environment'

/* Tipando a constante -> authenticate: restify.RequestHandler
    Tipar = Definir tipo */
export const authenticate: restify.RequestHandler = (req, resp, next)=>{
  const {email, password} = req.body
  User.findByEmail(email, '+password') // 1st step | utilizar o email para buscar nos documentos qual o respectivo usuário
    .then(user=>{ // se encontrar, executar função user
      if(user && user.matches(password)){ // 2nd step | se o then recebeu um usuário válido && a senha combinar
        const token = jwt.sign({sub: user.email, iss: 'meat-api'}, // 3rd step | gerar token
                  environment.security.apiSecret)
        resp.json({name: user.name, email: user.email, accessToken: token})
        return next(false)
      } else {
        return next(new NotAuthorizedError('Invalid Credentials'))  // exibe mensagem de erro na response
      }
  }).catch(next) // se houver problema, manda para a função <next>
}