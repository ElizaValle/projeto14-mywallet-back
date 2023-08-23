import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"

const app = express()
app.use(express.json())
app.use(cors())
dotenv.config()

// banco de dados
const mongoClient = new MongoClient(process.env.DATABASE_URL)
try {
    await mongoClient.connect()
    console.log("MongoDB conectado!")
} catch (err) {
    console.log(err.message)
}
const db = mongoClient.db()

// schemas
const schemaCadastro = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().min(3).required(),
    confirmeSenha: joi.string().min(3).required()
})

// endpoints
app.post("/sign-up", async (req, res) => {
    const { nome, email, senha, confirmeSenha } = req.body

    const validacao = schemaCadastro.validate(req.body, { abortEarly: false })
    if (validacao.error) return res.sendStatus(422)

    try {
        const emailUsuario = await db.collection("usuarios").findOne({ email })
        if (emailUsuario) return res.sendStatus(409)

        await db.collection("usuarios").insertOne({ nome, email, senha })

        res.sendStatus(201)

    } catch (err) {
        return res.status(500).send(err.message)
    }
})

// escuta da porta
const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))