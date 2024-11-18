import express, { Request, Response } from "express";
import mongoose, { ConnectOptions } from 'mongoose';
import cookieParser from 'cookie-parser';
// import {addFieldToUsers} from './API/users/updateUserDB'
import cors from 'cors'
import { corsOptions } from "./config/corsOptions";
import { sendEmail } from './services/mailService'; // Import the sendEmail function

//npm i dotenv
import dotenv from 'dotenv';
dotenv.config()

const app = express(); 
const port = process.env.PORT || 5000;

//middlewares
app.use(express.json());
app.use(express.urlencoded({limit: '25mb'})); //parses incoming URL-encoded data (like form submissions) and add it to req.body. it limit the size of the request body.
app.use(cors(corsOptions))

//middleware for using parser
app.use(cookieParser())

import connectionMongo from "./DBConnection/mongoDB";

//API routes
// get router from usersRouter
import userRoute from "./API/User/userRoute";
app.use("/api/users", userRoute);

// get router from rowModel
import rowRoutes  from "./API/Row/rowRoutes";
app.use("/api/data", rowRoutes);

// get router from columnModel
import columnRoutes  from "./API/Row/rowRoutes";
app.use("/api/column", columnRoutes);

import tableRoutes from "./API/Table/tableRoutes";
app.use("/api/tables", tableRoutes)

// Route for sending recovery email
import { isEmailExist } from "./API/User/userCont";
app.post("/send_recovery_email", async (req: Request, res: Response) => {
  try { 
    const email = req.body.recipient_email
    const emailExists = await isEmailExist(email);  // Await the async function
    if (emailExists) {
      sendEmail(req.body)
      .then((response) => res.send(response))
      .catch((error) => res.status(500).send(error.message));  
    } else {
      res.send("User email is not register, please register first")
    }
  } catch (error){
    console.error(error);
    res.status(500).send("Error while checking email existence");
  }
});

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    await connectionMongo;
  } catch (err) {
    console.error(err);
    process.exit(1); // Exit the process with a non-zero code
  }
};

connectToMongoDB()
  .then(() => {
    app.use((req, res, next) => {
      console.log(`Received request: ${req.method} ${req.url}`);
      next();
    });

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });