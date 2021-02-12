import * as mongoose from 'mongoose'

// Remove erro de definição de tipo da rota post /users
export interface User extends mongoose.Document {
    name: string,
    email: string,
    password: string
}

// Schema diz ao mongoose quais as propriedades e tipos dos documentos
const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        select: false // Oculta exposição do password
    }
})

// Model usado para manipular os documentos persistidos no MongoDB. Através dele é possível consultar, remover, alterar e criar documentos.
export const User = mongoose.model<User>('User', userSchema)