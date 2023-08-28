import { Router } from "express"
import { logout, signIn, signUp } from "../controllers/auth.controllers.js"

const authRouter = Router()

authRouter.post("/sign-up", signUp)
authRouter.post("/sign-in", signIn)
authRouter.post("/logout", logout)

export default authRouter