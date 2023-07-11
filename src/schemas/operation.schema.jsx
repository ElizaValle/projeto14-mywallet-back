import joi from "joi"

export const operationSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().required(),
    type: joi.string().valid("income", "expense").required()
})