import express from 'express'
import { handleLogin, handleRegister } from '../controller/userController.js'

const route = express.Router()

route.post('/register',handleRegister)
route.post('/login',handleLogin)


export default route