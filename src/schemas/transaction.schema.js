import joi from "joi"

export const schemaTransacao = joi.object({
    valor: joi.number().positive().precision(2).required(),
    descricao: joi.string().required(),
    tipo: joi.string().valid("proventos", "despesas").required()
})