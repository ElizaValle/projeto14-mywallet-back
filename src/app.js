import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import joi from "joi"
import bcrypt from "bcrypt"

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
const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required(),
    confirmPassword: joi.string().min(3).required()
})

// endpoints

// cadastro
app.post("/sign-up", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body

    const validation = userSchema.validate(req.body, { abortEarly: false })
    if (validation.error) return res.status(422).send(validation.error.details.map((d) => d.message))

    try {
        const user = await db.collection("users").findOne({ email })
        if (user) return res.status(409).send("E-mail já cadastrado!")

        const hash = bcrypt.hashSync(password, 10)
        
        await db.collection("users").insertOne({ name, email, password: hash })
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))