// Código que simula um banco de dados através das Promises

const users = [
    {id: "1", name: 'Peter Parker', email: 'peter@marvel.com'},
    {id: "2", name: 'Bruce Wayne', email: 'bruce@dc.com'}
]

export class User {
    static findAll(): Promise<any[]>{
        return Promise.resolve(users)
    }

    static findById(id: string): Promise<any>{ // Promise é somente para simular resposta asíncrona de um banco de dados
        return new Promise(resolve=>{
            const filtered = users.filter(user=> user.id === id) // filtro no array de users
            let user = undefined
            if(filtered.length > 0){ // método filter retorna um array, se o for maior que zero significa que existe algum ID
                user = filtered[0]
            }
            resolve(user) // se usuário for encontrado pelo <filter> será devolvido, caso contrário será passado undefined
        })
    }
}