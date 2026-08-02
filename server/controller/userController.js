import * as bcrypt from "bcrypt";
import user from "../models/User.js";
import jwt from 'jsonwebtoken'

//register controller
export const handleRegister = async (req, res) => {
 
    try {
        const { username, email, password } = req.body;

        const User = await user.findOne({email:email})

        const hashed = await bcrypt.hash(password,10);
        const userData = {
        username: username,
        email: email,
        password: hashed,
        };
        if(!User){
            await user.create(userData)
            res.status(201).json({
                message:'user created'
            })
       }else{
            res.status(409).json({
                messge:"user already exist"
            })
       }      
    } catch (error) {
        res.status(500).json({
        message: "something went wrong",
        error: error,
        });
        console.log(error);
  }
};

//login controller
export const handleLogin = async (req, res) => {
  
  try {
    const {email,password} = req.body;
    const User = await user.findOne({email:email})
    console.log(User.password);
    
    if(User){
       const isMatch = await bcrypt.compare(password,User.password)
       if(isMatch){
        const payload = {
            username:User.username,
            email:email
        }
        res.json({
            data:payload,
            message:`welcome back ${payload.username}`
        })
       }else{
        res.json({
            message:'Invalid credentials'
        })
       }
    }
     else {
        res.status(401).json({
            message:'user not found'
        })
    }
  } catch (error) {
    console.log(error);
  }
};
