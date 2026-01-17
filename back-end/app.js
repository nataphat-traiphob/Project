import cors from "cors";
import morgan from "morgan";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    methods: ['GET' , 'POST' , 'PUT' , 'PATCH' , 'DELETE' , 'OPTIONS'],
    allowedHeaders: ['Content-Type' , 'Authorization'],
}))

app.use(express.urlencoded({extended : true}))
app.use(express.json());
app.use(morgan('dev'));

app.use("/uploads/products" , express.static(path.join(__dirname , "uploads/products/active")));
app.use("/public" , express.static(path.join(__dirname , "public")));

// Import Routes

import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.rotes.js'
import meRoutes from './routes/me.routes.js'

// Use Routes

app.use("/api/auth" , authRoutes)
app.use("/api/users" , usersRoutes)
app.use("/api/me" , meRoutes)

app.use((req , res , next) => {
    res.status(404).json({success : false , message:"Page not found"})
})

import errorHandler from "./middlewares/errorHandler.js";
app.use(errorHandler)


export default app;