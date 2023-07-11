import express from "express"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import operationRouter from "./routes/operation.routes.js"

const app = express()

app.use(express.json())
app.use(cors())
app.use(userRouter)
app.use(operationRouter)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`))