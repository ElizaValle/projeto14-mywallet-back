import { db } from "../database/database.connection.js"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"

export async function signUp(req, res) {
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
}

export async function signIn(req, res) {
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
}

export async function loggedUser(req, res) {
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
}

export async function logout(req, res) {
    const { token } = res.locals.session 

    try {
        await db.collection("session").deleteOne({ token })
        res.sendStatus(200)
    } catch (err) {
        res.status(500).send(err.message)
    }
}