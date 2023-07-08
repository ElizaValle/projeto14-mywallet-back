import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import joi from "joi"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"

const app = express()

app.use(express.json())
app.use(cors())
dotenv.config()

// conexão banco de dados
const mongoClient = new MongoClient(process.env.DATABASE_URL)
try {
    await mongoClient.connect()
    console.log('MongoDB conectado!')
} catch (err) {
    console.log(err.message)
}

const db = mongoClient.db()

// schemas
const registerSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required(),
    confirmPassword: joi.string().min(3).required()
})

const userSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(3).required()
})

const transactionSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().required()
})

// endpoints

// cadastro
app.post("/sign-up", async (req, res) => {
    const { name, email, password } = req.body

    const validation = registerSchema.validate(req.body, { abortEarly: false })
    if(validation.error) return res.status(422).send(validation.error.details.map((d) => d.message))

    try {
        const user = await db.collection("users").findOne({ email })
        if(user) return res.status(409).send("E-mail já cadastrado!")

        const hash = bcrypt.hashSync(password, 10)

        await db.collection("users").insertOne({ name, email, password: hash })
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// login
app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body

    const validation = userSchema.validate(req.body, { abortEarly: false })
    if(validation.error) return res.status(422).send(validation.error.details.map((d) => d.message))

    try {
        const user = await db.collection("users").findOne({ email })
        if(!user) return res.status(404).send("Usuário não cadastrado!")

        const passwordIsCorrect = bcrypt.compareSync(password, user.password)
        if(!passwordIsCorrect) return res.status(401).send("Senha incorreta!")

        //await db.collection("session").deleteMany({ userId: user._id }) - se quiser deletar todas as sessões antigas do usuário
        const token = uuid()
        await db.collection("session").insertOne({ token, userId: user._id })

        res.status(201).send(token)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// rota para uso do token - pega dados do usuário
app.get("/logged-user", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if(!token) return res.sendStatus(401)

    try {
        const session = await db.collection("session").findOne({ token })
        if(!session) return res.sendStatus(401)

        const user = await db.collection("users").findOne({ _id: session.userId })

        delete user.password
        res.send(user)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// rota para transação do tipo entrada ou saída
app.post("/transaction", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    const { value, description } = req.body

    // validação do token
    if(!token) return res.sendStatus(401)

    // validação do body
    const validation = transactionSchema.validate(req.body, { abortEarly: false })
    if(validation.error) return res.status(422).send(validation.error.details.map((d) => d.message))

    try {
        const session = await db.collection("session").findOne({ token })
        if(!session) return res.sendStatus(401)

        const transaction = await db.collection("transaction").insertOne({ value, description })
        
        res.send(transaction)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))