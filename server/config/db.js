import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const response = await mongoose.connect(`${process.env.MONGODB_URL}/gridflow`);
    if (response) {
      console.log("mongodb connected");
    } else {
      console.log("mongodb connection faild");
    }
  } catch (error) {
    console.log(error);
  }
};
