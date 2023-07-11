import { Router } from "express"
import { loggedUser, logout, signIn, signUp } from "../controllers/user.controllers.jsx"

const userRouter = Router()

// cadastro
userRouter.post("/sign-up", signUp())

// login
userRouter.post("/sign-in", signIn())

// rota para uso do token - pega dados do usuário
userRouter.get("/logged-user", loggedUser())

// logout
userRouter.post("/logout", logout())

export default userRouter