import express from "express"
import cors from "cors"
import authRouter from "./routes/auth.routes.js"
import transactionRouter from "./routes/transaction.routes.js"

const app = express()
app.use(express.json())
app.use(cors())
app.use(authRouter)
app.use(transactionRouter)

const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))