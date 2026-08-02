
import { json } from "express"
import express from 'express'
import cors from 'cors'
import { configDotenv } from "dotenv"
import { connectDB } from "./config/db.js"
import route from "./route/userRoute.js"

configDotenv()
connectDB()
const app = express()
app.use(cors())
app.use(json())

app.use(route)


app.listen(process.env.PORT ,
           ()=>console.log(`Server is running on => http://localhost:${process.env.PORT}`));

