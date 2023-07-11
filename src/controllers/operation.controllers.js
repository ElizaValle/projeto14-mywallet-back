import { db } from "../database/database.connection.js"

export async function createOperation(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    const { value, description } = req.body

    // validação do token
    if(!token) return res.sendStatus(401)

    // validação do body
    const validation = operationSchema.validate(req.body, { abortEarly: false })
    if(validation.error) return res.status(422).send(validation.error.details.map((d) => d.message))

    try {
        const session = await db.collection("session").findOne({ token })
        if(!session) return res.sendStatus(401)

        const user = await db.collection("users").findOne({ _id: session.userId })

        delete user.password

        const operation = await db.collection("operation").insertOne({ userId: user._id, value, description })
        
        res.send({ user, operation })
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function getOperation(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if(!token) return res.sendStatus(401)

    try {
        const session = await db.collection("session").findOne({ token })
        if(!session) return res.sendStatus(401)

        const user = await db.collection("users").findOne({ _id: session.userId })

        delete user.password

        // obtem todas as operações do usuário
        const operations = await db.collection("operation")
            .find({ userId: session.userId })
            .sort({ date: -1 })  // ordena por data decrescente
            .toArray()
        
        // calcula saldo final
        const totalEntry = operations.reduce((accumulatedValue, operation) => {
            return operation.value > 0 ? accumulatedValue + operation.value : accumulatedValue
        }, 0)

        const totalOutput = operations.reduce((accumulatedValue, operation) => {
            return operation.value < 0 ? accumulatedValue + operation.value : accumulatedValue
        }, 0)

        const totalBalance = totalEntry + totalOutput
        
        res.send({ user, operations, totalEntry, totalOutput, totalBalance })

    } catch (err) {
        res.status(500).send(err.message)
    }
}