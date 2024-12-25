import bcrypt from "bcrypt";
import jwt from "jwt-simple";
import {
  addFieldToSchemaAndMongoDB,
  deleteFieldFromSchemaAndMongoDB,
  deleteOneDataFromMongoDB,
  getAllDataFromMongoDB,
  getOneDataFromMongoDB,
  updateDataOnMongoDB
} from "../../mongoDB/mongoose/mongoCRUD/withMongoose/mongoCRUD";
import { isItemExist } from "../helpFunctions";
import { UserModel } from "./userModel";
import mongoose from "mongoose";

const { JWT_SECRET } = process.env;
const secret = JWT_SECRET;

const saltRounds = 10;

//!create
//register user
export const addUser = async (req: any, res: any) => {
  try {
    console.log("hello from server registerUser");
    const { email, password } = req.body;
    console.log({ password }, { email });
    if (!password || !email)
      throw new Error("At userCont-registerUser complete all fields");
    //check if email exist already, if so reject the registration
    // @ts-ignore
    const emailExists = await isItemExist(UserModel, { email: email }); // Await the result
    if (emailExists) {
      //if email exist (true)
      res.send({ ok: false, massage: "Email exist" });
    } else {
      //encode password with bcrypt.js
      const hash = await bcrypt.hash(password, saltRounds);

      const user = new UserModel({ email, password: hash });
      const userDB = await user.save(); //if there is problem saving in DB it catch the error
      console.log(userDB);
      if (userDB) {
        res.send({ ok: true });
      } else {
        res.send({ ok: false });
      }
    }
  } catch (error) {
    console.error(error);
    res.send({ ok: false, error: "server error at register-user" });
  }
}; //work ok

//add new field to all users
export async function addUserField(req: any, res: any) {
  try {
    const fieldName = req.body.fieldName;
    if (!fieldName) throw new Error("At addUserField no fieldName found");

    await addFieldToSchemaAndMongoDB(UserModel, fieldName, " ");
    res.send({ ok: true, massage: "documents were updated with the field" });
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
} //work ok

//!read
//get one user
export async function getUser(req: any, res: any) {
  try {
    const userId = new mongoose.Types.ObjectId(String(req.params.userId));
    if (!userId) throw new Error("at getUser no userId found");

    const user = await getOneDataFromMongoDB(UserModel, userId);

    if (user.ok) {
      res.send(user.response); //return the user data
    } else {
      res.send(user.ok); //return false
    }
  } catch (error) {
    console.error(error);
  }
} //work ok

// get all users
export async function getAllUsers(req: any, res: any) {
  try {
    console.log("getAllUsers function");
    const dataDB = await getAllDataFromMongoDB<any>(UserModel);
    console.log("At getAllUsers dataDB:", dataDB);
    res.send({ data: dataDB }); //send to client the users information
  } catch (error) {
    console.error(error);
  }
} //not in use

//!update 
export async function updateUserFieldsValue(req: any, res: any) {
  try {
    const userID = req.params.userID;
    if (!userID) throw new Error("no word id in params updateWord");
    console.log("at updateUserFieldsValue the userID:", userID);

    const { field } = req.body;
    console.log("at updateUserFieldsValue the field:", field); //ok

    const { updateData } = req.body;

    if (!field || !updateData) throw new Error("missing data required field or updateData");

    const update = {[field]: updateData}
    console.log("at updateUserFieldsValue the update:", update);
    
    //find the word in DB by word_id and update the require field
    const newUpdated = await updateDataOnMongoDB(UserModel, { _id: userID }, update)
    console.log("at updateUserFieldsValue the newUpdated", newUpdated)
      res.send(newUpdated); 
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
} // work ok

//!delete
//delete user by email and password
export async function deleteUser(req: any, res: any) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("please fill all");

    //check if user exist and password is correct
    const userDB = await UserModel.findOne({ email });
    console.log("At deleteUser the userDB:", userDB);

    if (!userDB) throw new Error("some of the details are incorrect");

    const { password: hash } = userDB;
    if (!hash) throw new Error("some of the details are incorrect");

    //check if hash password is equal to the password that the user entered
    const match: boolean = await bcrypt.compare(password, hash);
    if (!match) throw new Error("some of the details are incorrect");

    await deleteOneDataFromMongoDB(UserModel, { email });
    res.send({ ok: true });
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
} //work ok

//delete field from all users
export async function deleteUserField(req: any, res: any) {
  try {
    const fieldName = req.body.fieldName;
    if (!fieldName) throw new Error("At deleteUserField no fieldName found");

    await deleteFieldFromSchemaAndMongoDB(UserModel, fieldName);
    res.send({
      ok: true,
      massage: "field successfully deleted from all documents",
    });
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
} //?

//! uniq functions for users
//update email and password 
export async function updateUserEmailAndPassword(req: any, res: any) {
  try {
    const { oldEmail, oldPassword, newEmail, newPassword } = req.body;
    if (!oldEmail || !oldPassword || !newEmail || !newPassword)
      throw new Error("please fill all");
    console.log("At updateUserDetails the oldEmail:", oldEmail);
    console.log("At updateUserDetails the oldPassword:", oldPassword);
    console.log("At updateUserDetails the newEmail:", newEmail);
    console.log("At updateUserDetails the newPassword:", newPassword);

    //check if user exist and password is correct
    const userDB = await UserModel.findOne({ email: oldEmail });
    console.log("At updateUserDetails the userDB:", userDB);

    if (!userDB) throw new Error("some of the details are incorrect");
    const { password: hash } = userDB;
    if (!hash) throw new Error("some of the details are incorrect");

    //check if hash password is equal to the password that the user entered
    const match: boolean = await bcrypt.compare(oldPassword, hash);
    if (!match) throw new Error("some of the details are incorrect");

    const updatedUser = await updateDataOnMongoDB(
      UserModel,
      { email: oldEmail }, //search the doc by the old-email
      {
        //update thous fields
        email: newEmail,
        password: await bcrypt.hash(newPassword, 10), // Hash the new password before saving
      }
    );
    console.log("At updateUserDetails the newUserDB:", updatedUser);

    res.send({ ok: true, updatedUser });
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
} //work ok

//reset user password
export const resetUserPassword = async (req: any, res: any) => {
  try {
    console.log("Hello from server resetPassword");

    const { email, password } = req.body;
    console.log({ password }, { email });
    if (!password || !email)
      throw new Error("At userCont-resetPassword complete all fields");

    //check if email exist , if so update the user password
    //@ts-ignore
    const isEmailExists = await isItemExist(UserModel, {
      filterCriteria: email,
    }); // Await the result
    console.log("at resetPassword the isEmailExists answer is:", isEmailExists);

    if (!isEmailExists) {
      //if email not exist (false)
      res.send({ ok: false, massage: "Email not exist" });
    } else {
      //encode password with bcrypt.js
      const hash = await bcrypt.hash(password, saltRounds);
      console.log("hash:", hash);

      const userDB = await updateDataOnMongoDB(
        UserModel,
        { email },
        { password: hash }
      );
      console.log("userDB:", userDB);

      if (userDB) {
        res.send({ ok: true });
      } else {
        res.send({ ok: false });
      }
    }
  } catch (error) {
    console.error(error);
    res.send({ ok: false, error: "server error at register-user" });
  }
}; //work ok

//login user
export const connectUser = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    console.log("At userCont login:", { email, password });
    if (!password || !email)
      throw new Error("At userCont login: complete all fields");

    //check if user exist and password is correct
    const userDB = await UserModel.findOne({ email });

    if (!userDB)
      throw new Error("At userCont login: some of the details are incorrect");

    const { password: hash } = userDB;

    if (!hash)
      throw new Error("At userCont login: some of the details are incorrect");

    //check if hash password is equal to the password that the user entered
    const match: boolean = await bcrypt.compare(password, hash);
    if (!match)
      throw new Error("At userCont login: some of the details are incorrect");

    //create and encode cookie with JWT
    // encode
    const JWTCookie = jwt.encode(userDB._id, secret); //the id given by mongo is store in the cookie - encoded!
    console.log("At userCont login JWTCookie:", JWTCookie); //got it here!
    res.cookie("user", JWTCookie, {
      // httpOnly: true,  //makes the cookie inaccessible via JavaScript on the client side. It won't show up in document.cookie or the browser's developer tools.
      path: "/", // Set the path to root to make it available across the entire site
      sameSite: "None", // Required for cross-origin cookies
      secure: false, //!true for PROD, false for DEV
      maxAge: 1000 * 60 * 60 * 24, //1 day
    }); //send the cookie to client
    res.send({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(401).send({ error });
  }
}; //work ok
