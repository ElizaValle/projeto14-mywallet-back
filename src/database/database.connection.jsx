import dotenv from "dotenv"
import { MongoClient } from "mongodb"

dotenv.config()

// conexão banco de dados
const mongoClient = new MongoClient(process.env.DATABASE_URL)
try {
    await mongoClient.connect()
    console.log('MongoDB conectado!')
} catch (err) {
    console.log(err.message)
}

export const db = mongoClient.db()