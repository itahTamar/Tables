import express from 'express';
// import cookieParser from 'cookie-parser';
import cors from 'cors'
import { corsOptions } from './config/corsOptions';

require('dotenv').config();
import connectMongo from './DBConnection/mongoDB';

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json());
// app.use(cookieParser());

app.use(cors(corsOptions))

import mongoRoute from "./CRUD/mongoRoute"
app.use("/api/mongoRoute", mongoRoute)

// Connect to MongoDB
connectMongo()
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})