import { db } from "../database/database.connection.js"
import { schemaTransacao } from "../schemas/transaction.schema.js"
import dayjs from "dayjs"

export async function novaTransacao(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    const { valor, descricao, tipo } = req.body

    if (!token) return res.sendStatus(401)

    const validacao = schemaTransacao.validate(req.body, { abortEarly: false })
    if (!validacao) return res.sendStatus(422)

    try {
        const sessao = await db.collection("sessoes").findOne({ token })
        if (!sessao) return res.sendStatus(401)

        const usuarioId = sessao.usuarioId

        const usuario = await db.collection("usuarios").findOne({ _id: sessao.usuarioId })
        if (!usuario) return res.sendStatus(401)

        // delete usuario.senha

        await db.collection("transacoes").insertOne({ valor: Number(valor), descricao, tipo, usuarioId, date: dayjs().valueOf() })

        res.sendStatus(201)

    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function pegaTransacao(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return res.sendStatus(401)

    try {
        const sessao = await db.collection("sessoes").findOne({ token })
        if (!sessao) return res.sendStatus(401)

        const usuario = await db.collection("usuarios").findOne({ _id: sessao.usuarioId })
        if (!usuario) return res.sendStatus(401)

        // delete usuario.senha

        const transacoes = await db.collection("transacoes")
            .find({ usuarioId: sessao.usuarioId })
            .sort({ date: -1 })
            .toArray()

        res.send(transacoes)

    } catch (err) {
        return res.status(500).send(err.message)
    }
}