import { Router } from "express"
import { novaTransacao, pegaTransacao } from "../controllers/transaction.controllers.js"

const transactionRouter = Router()

transactionRouter.post("/nova-transacao", novaTransacao)
transactionRouter.post("/transacao", pegaTransacao)

export default transactionRouter