
import express from "express"
import cors from "cors"
import Mongodb_connection from "./db/connection.js"
import { config } from "dotenv"
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"

config()

Mongodb_connection()

const app = express()

//middleware
app.use(cors())
app.use(express.json())
app.use(cookieParser(process.env.COOKIE_SECRET));

//routes
app.get('/',(req,res)=>{
    res.send("Hello world")
})

app.use('/api/v1/user',userRoutes)
app.use('/api/v1/chat',chatRoutes)

//port connection
const PORT = process.env.PORT || 5000
app.listen(PORT , ()=>{
    console.log(`App is listening on ${PORT}`)
})