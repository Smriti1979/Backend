import mongoose from "mongoose";

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";

dotenv.config({path: "./env"});

const app = express();

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>
    {
        console.log(`Server is running on PORT: ${process.env.PORT || 8000}`);
    })
    app.on("error", (error) => 
        {console.error("SERVER ERROR: ", error)
        throw error;
    });
})
.catch(error => console.error("MONDODB CONNECTION ERROR: ", error));

