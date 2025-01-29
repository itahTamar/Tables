import express, { Request, Response } from "express";
import cookieParser from 'cookie-parser';
// import {addFieldToUsers} from './API/users/updateUserDB'
//npm i dotenv
import dotenv from 'dotenv';
dotenv.config()
import cors from 'cors'
import { corsOptions } from "./config/corsOptions";
import { sendEmail } from './services/mailService'; // Import the sendEmail function

const app = express(); 
const port = process.env.PORT || 5000;

//middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); //parses incoming URL-encoded data (like form submissions) and add it to req.body. it limit the size of the request body.
app.use(cors(corsOptions))

//middleware for using parser
app.use(cookieParser())

//connection to db
import connectionMongoWithMongoose from "./mongoDB/mongoose/DBConnection/mongooseMongoDBConnection";
// import { connectToDatabase } from "./mongoDB/nativeDriver/nativeMongoDBConnection";
import { MongoDBWrapper } from "./mongoDB/nativeDriver/mongoDBWrapper";

//API routes
import userRoutes from "./API/User/userRoutes";
app.use("/api/users", userRoutes);

import docRouter from "./API/Docs/docRouter";
app.use("/api/doc", docRouter)

// Route for sending recovery email
import { isItemExist } from "./API/helpFunctions";
import { UserModel } from "./API/User/userModel";

app.post("/send_recovery_email", async (req: Request, res: Response) => {
  try { 
    const email = req.body.recipient_email
    //@ts-ignore
    const emailExists = await isItemExist(UserModel,{email: email});  // Await the async function
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
    //with mongoose
    await connectionMongoWithMongoose;

    //with native driver
    // await connectToDatabase();

    //with wrapper
    await MongoDBWrapper.connectMongoDB()
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