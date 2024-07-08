import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        const ConnectionInstence =await mongoose.connect(`${process.env.MONGODB_URI}/${ DB_NAME}`)
        console.log("Database connected successfully:", ConnectionInstence.connection.host);
    } catch (error) {
        console.log("Connection Error:", error);
        process.exit(1);
    }
};

export default connectDB;
