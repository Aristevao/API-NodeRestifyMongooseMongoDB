import {User} from './users/users.model'
declare module 'restify'{

/* Removendo o erro causado no authenticated pelo TypeScript ao inserir:
    (<req>).authenticated = user
    Outra maneira de remover o erro: TypeScript reclama, mas em runtime não há problema. Para remover o erro, inserir any. Ex: (<req>).authenticated = user
    Erro exibido no console se não for tratado:
    error TS2339: Property 'authenticated does not exist on type 'Request   */
export interface Request {
    authenticated: User // authenticated = tipo User
}
}