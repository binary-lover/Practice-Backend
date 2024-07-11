import mongoose from "mongoose";
import connectDB from "./db/index.js";
import { DB_NAME } from "./constants.js";
import dotenv from "dotenv";
import express from "express";

dotenv.config({path: "../.env"}); // to access the environment variables

// defining the express app variable
const app = express();



connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
} )
.catch((error)=>{
    console.log("MongoDB not connected..!!!", error);
});



// connecting to the database using iffie function
// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${ DB_NAME}` )
//         app.on("error", (error) =>{
//             console.log("Error:", error);
//             throw error;
            
//         })
//         app.listen(process.env.PORT, () =>{
//             console.log(`Server is running on port ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.error(error);
//     }
// })();