import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,requires:true}
})

const  user = mongoose.model.user || mongoose.model("users",userSchema)

export default user