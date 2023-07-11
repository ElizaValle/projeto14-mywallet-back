import { Router } from "express"
import { createOperation, getOperation } from "../controllers/operation.controllers.jsx"

const operationRouter = Router()

// rota para operações do tipo entrada ou saída
operationRouter.post("/operation", createOperation())

// lista todas as operações 
operationRouter.get("/operation", getOperation())

export default operationRouter