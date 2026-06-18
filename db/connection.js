
import mongoose from "mongoose";

const Mongodb_connection = async()=>{
    try {
    await mongoose.connect(process.env.MONGO_DB_URL) 
    console.log("Database connected")
  } catch (error) {
    console.log(error)
    throw new Error("Cannot connect to mongodb")
}
}

export default Mongodb_connection;