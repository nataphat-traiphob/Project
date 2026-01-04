import cors from "cors";
import morgan from "morgan";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '',
    methods: ['GET' , 'POST' , 'PUT' , 'PATCH' , 'DELETE' , 'OPTIONS'],
    allowedHeaders: ['Content-Type' , 'Authorization'],
}))

app.use(express.urlencoded({extended : true}))
app.use(express.json());
app.use(morgan('dev'));

app.use("/uploads" , express.static(path.join(__dirname , "uploads")));
app.use("/public" , express.static(path.join(__dirname , "public")));


export default app;