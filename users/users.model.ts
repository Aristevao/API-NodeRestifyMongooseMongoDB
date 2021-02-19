import * as mongoose from 'mongoose'
import {validateCPF} from '../common/validator'
import * as bcrypt from 'bcrypt'
import {environment} from '../common/environment'

// Intrerface para representar o document. Criado para remover erro gerado pelo TypeScript de definição de tipo da rota post /users
export interface User extends mongoose.Document {
    name: string,
    email: string,
    password: string
}

// Interface para representar o model. Criada para remover o erro gerado pelo TypeScript ao usar o método findByEmail
export interface UserModel  extends mongoose.Model<User> {
    findByEmail(email: string): Promise<User>
}

// Schema diz ao mongoose quais as propriedades e tipos dos documentos
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 30,
        minlength: 3
    },
    email: {
        type: String,
        unique: true,
        required: true,
        // <match> determina a expressão regular aceita nesse campo
        match: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    password: {
        type: String,
        required: true,  
        select: false // Oculta exposição do password
    },
    gender: {
        type: String,
        required: false,
        enum: ['Male', 'Female'] // Restringe inserção a determinadas palavras 
    },
    cpf: {
        type: String,
        unique: true,
        required: false,
        validate: {
            validator: validateCPF,
            message: '{PATH}: Invalid CPF ({VALUE})'
        }
    }
})

/* Criando método personalizado no model
    Propriedade do statics <findByEmail> é a definição do nome do método
    Não pode ser usado arrow function por causa do <this>
    Para o TypeScript aceitar o método, é preciso criar uma interface    */
userSchema.statics.findByEmail = function(email: string){
    return this.findOne({email}) // Escrever somente <email> é o mesmo que < {email: email} >
}

/* Criptografando senha com bcrypt
    1° arg: o que vai ser criptitografado
    2° arg: número de rounds usado para gerar o hash
    número de rounds são os ciclos que o bcrypt usa para colocar interação dinâmica para gerar o hash. <10> significa que esse ciclo será feito 10x
    hash é uma função OneWay; dado determinada entrada é produzido determinado algorítmo não reversível. Não é possível voltar do dado criptografado para o dado de entrada   */
const hashPassword = (obj, next)=>{
    bcrypt.hash(obj.password, environment.security.saltRounds)
            .then(hash=>{
                obj.password = hash
                next()
            }).catch(next)
}

const saveMiddleWare = function(next){  // Similar ao next do Restify
    const user: User = this // Não usar <Arrow function> por causa do <this>
    if(!user.isModified('password')){ // Verifica se password foi modificado
        next()
    }else{
        hashPassword(user, next)
    }
}

const updateMiddleware = function(next){ 
    if(!this.getUpdate().password){ // Verifica se password foi modificado
        next()
    }else{
        hashPassword(this.getUpdate(), next)
    }
}

/*  MiddleWare
MiddleWare para criptografar um evento 'save'. Será ativada quando usar um método save (POST)
OBS: Querys não rodam as validações (find, findById,etc.). Para validar, usar <runValidators> --> const options  = {runValidators: true, overwrite: true}  << Não funcionando em PUT >>  */
userSchema.pre('save', saveMiddleWare)

// MiddleWare para criptografar um evento que utiliza elementos query (find, findOne). Será ativada quando usar um método que contenha querys, como PUT 
userSchema.pre('findOneAndUpdate', updateMiddleware)

// MiddleWare para criptografar um evento que utiliza 'update'. Será ativada quando usar um método que contenha querys, como PATCH
userSchema.pre('update', updateMiddleware)

// Exportando interfaces. Model usado para manipular os documentos persistidos no MongoDB. Através dele é possível consultar, remover, alterar e criar documentos.
export const User = mongoose.model<User, UserModel>('User', userSchema)