import * as restify from 'restify'
import * as jwt from 'jsonwebtoken'
import {User } from '../users/users.model'
import{environment} from '../common/environment'

export const tokenParser: restify.RequestHandler = (req, resp, next) =>{
    const token = extractToken(req)
    if(token){
        jwt.verify(token, environment.security.apiSecret, applyBearer(req, next)) // 1° arg - token a ser verificado | 2° arg - password usado na criação do token | 3° arg - callback chamada quando a verificação foi concluída. Vai dizer se o token foi verificado ou se houve erro ao tentar codificar
    } else{
        next() // se o token não existir, deixar passar. Porque o objetivo do tokenParser é fazer a conversão do token e sim checar se o token existe e fazer decoded, não autorização.
    }
}

function extractToken(req: restify.Request){
    // Autorization: Bearer TOKEN | Validando o formato esperado para o token (schema de autorização). (Bearer = portador do token)
    const authorization = req.header('authorization')
    if(authorization){
        const parts:string[] = authorization.split(' ') // Dividindo <Bearer TOKEN> em um array e separando suas partes com espaço em branco
        if(parts.length === 2 && parts[0] === 'Bearer'){ // se parts tiver 2 itens no array e o 1° índice for <Bearer>
            return parts[1] // retorna o índice 1 do array (TOKEN)
        }
    }
    return undefined // se nenhuma dessas validações for TRUE, retorna UNDEFINED
}

function applyBearer(req: restify.Request, next){ // <req> para associar o usuário autenticado a ele
    return(error, decoded) =>{
        if(decoded){// Checar se o token foi codificado corretamente. Se não existir o parãmetro será dado como undefined, se existir terá valor dentro do if (true)
            User.findByEmail(decoded.sub).then(user=>{
                if(user){
                    req.authenticated = user    // associar o usuário no request. TypeScript reclama, mas em runtime não há problema. Para remover o erro, inserir any. Ex: (<req>).authenticated = user
                }else{
                    return next()
                }
            }) // decoded.sub -> pega o value da key <sub> do objeto token criado em auth.handler
        }else{
            next() // se o token não existir, deixar passar. Porque o objetivo do tokenParser é fazer a conversão do token e sim checar se o token existe e fazer decoded, não autorização.
        }
    }
}