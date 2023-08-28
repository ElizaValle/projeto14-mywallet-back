import joi from "joi"

export const schemaCadastro = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().min(3).required(),
    confirmeSenha: joi.string().min(3).required()
})

export const schemaLogin = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().min(3).required()
})