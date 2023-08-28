import { db } from "../database/database.connection.js"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"
import { schemaCadastro, schemaLogin } from "../schemas/auth.schema.js"

export async function signUp(req, res) {
    const { nome, email, senha } = req.body

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
}

export async function signIn(req, res) {
    const { email, senha } = req.body

    const validacao = schemaLogin.validate(req.body, { abortEarly: false })
    if (validacao.error) return res.sendStatus(422)

    try {
        const usuario = await db.collection("usuarios").findOne({ email })
        if (!usuario) return res.sendStatus(404)

        if (!bcrypt.compareSync(senha, usuario.senha)) return res.sendStatus(401) 

        const token = uuid()

        await db.collection("sessoes").insertOne({ usuarioId: usuario._id, token })

        res.status(200).send({ token, nomeUsuario: usuario.nome })

    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function logout(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) res.sendStatus(401)

    try {
        await db.collection("sessoes").deleteOne({ token })

        res.sendStatus(200)

    } catch (err) {
        return res.status(500).send(err.message)
    }
}