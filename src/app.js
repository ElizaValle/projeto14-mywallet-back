import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"

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

const schemaLogin = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().min(3).required()
})

// endpoints
app.post("/sign-up", async (req, res) => {
    const { nome, email, senha, confirmeSenha } = req.body

    const senhaHash = bcrypt.hashSync(senha, 10)

    const validacao = schemaCadastro.validate(req.body, { abortEarly: false })
    if (validacao.error) return res.sendStatus(422)

    try {
        const usuario = await db.collection("usuarios").findOne({ email })
        if (usuario) return res.status(409).send("E-mail já cadastrado!")

        await db.collection("usuarios").insertOne({ nome, email, senha: senhaHash })

        res.sendStatus(201)

    } catch (err) {
        return res.status(500).send(err.message)
    }
})

app.post("/sign-in", async (req, res) => {
    const { email, senha } = req.body

    const validacao = schemaLogin.validate(req.body, { abortEarly: false })
    if (validacao.error) return res.sendStatus(422)

    try {
        const usuario = await db.collection("usuarios").findOne({ email })
        if (!usuario) return res.sendStatus(404)

        if (!bcrypt.compareSync(senha, usuario.senha)) return res.sendStatus(401) 

        const token = uuid()

        await db.collection("sessoes").insertOne({ usuarioId: usuario._id, token })
        
        res.sendStatus(200)

    } catch (err) {
        return res.status(500).send(err.message)
    }
})

// escuta da porta
const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))