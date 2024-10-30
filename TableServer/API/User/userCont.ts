import bcrypt from "bcrypt";
import jwt from "jwt-simple";
import {
  deleteOneDataFromMongoDB,
  findOneAndUpdateDataOnMongoDB,
  getOneDataFromMongoDB,
} from "./../../CRUD/mongoCRUD";
import { UserModel } from "./userModel";

const { JWT_SECRET } = process.env;
const secret = JWT_SECRET;

const saltRounds = 10;

//register user
export const registerUser = async (req: any, res: any) => {
  try {
    console.log("hello from server registerUser");
    const { email, password } = req.body;
    console.log({ password }, { email });
    if (!password || !email)
      throw new Error("At userCont-registerUser complete all fields");
    //check if email exist already, if so reject the registration
    const emailExists = await isEmailExist(email); // Await the result
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

//login user
export const login = async (req: any, res: any) => {
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
    const JWTCookie = jwt.encode(userDB._id, secret); //the id given by mongo is store in the cookie
    console.log("At userCont login JWTCookie:", JWTCookie); //got it here!
    res.cookie("user", JWTCookie, {
      // httpOnly: true,  //makes the cookie inaccessible via JavaScript on the client side. It won't show up in document.cookie or the browser's developer tools.
      path: "/", // Set the path to root to make it available across the entire site
      sameSite: "None", // Required for cross-origin cookies
      secure: false, //!true for PROD, false for DEV
      // secure: true, //!true for PROD, false for DEV
      maxAge: 1000 * 60 * 60 * 24, //1 day
    }); //send the cookie to client
    res.send({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(401).send({ error });
  }
}; //work ok

export async function deleteUser(req: any, res: any) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("please fill all");

    //check if user exist and password is correct
    const userDB = await UserModel.findOne({ email });
    console.log("At deleteUser the userDB:", userDB)

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

export async function updateUserDetails(req: any, res: any) {
  try {
    const { oldEmail, oldPassword, newEmail, newPassword } = req.body;
    if (!oldEmail || !oldPassword || !newEmail || !newPassword)
      throw new Error("please fill all");
    console.log("At updateUserDetails the oldEmail:", oldEmail)
    console.log("At updateUserDetails the oldPassword:", oldPassword)
    console.log("At updateUserDetails the newEmail:", newEmail)
    console.log("At updateUserDetails the newPassword:", newPassword)

    //check if user exist and password is correct
    const userDB = await UserModel.findOne({ email: oldEmail });
    console.log("At updateUserDetails the userDB:", userDB)

    if (!userDB) throw new Error("some of the details are incorrect");
    const { password: hash } = userDB;
    if (!hash) throw new Error("some of the details are incorrect");

    //check if hash password is equal to the password that the user entered
    const match: boolean = await bcrypt.compare(oldPassword, hash);
    if (!match) throw new Error("some of the details are incorrect");

    const updatedUser = await findOneAndUpdateDataOnMongoDB(UserModel,
      { email: oldEmail },  //search the doc by the old-email
      { //update thous fields
        email: newEmail,
        password: await bcrypt.hash(newPassword, 10) // Hash the new password before saving
      }
    );
    console.log("At updateUserDetails the newUserDB:", updatedUser)

    res.send({ ok: true , updatedUser});
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
} //work ok

//check if the user email is existing in DB, return true or false
export async function isEmailExist(email) {
  try {
    console.log("isEmailExist function");
    const filterCriteria = email;
    console.log("At isEmailExist filterCriteria:", filterCriteria);
    const dataDB = await getOneDataFromMongoDB<any>(UserModel, {
      email: filterCriteria,
    });
    console.log("At isEmailExist dataDB:", dataDB);
    console.log("At isEmailExist dataDB.ok:", dataDB.ok);
    return dataDB.ok;
  } catch (error) {
    console.error(error);
    return error;
  }
} //work ok

//reset user password
export const resetPassword = async (req: any, res: any) => {
  try {
    console.log("Hello from server resetPassword");

    const { email, password } = req.body;
    console.log({ password }, { email });
    if (!password || !email)
      throw new Error("At userCont-resetPassword complete all fields");

    //check if email exist , if so update the user password
    const isEmailExists = await isEmailExist(email); // Await the result
    console.log("at resetPassword the isEmailExists answer is:", isEmailExists);

    if (!isEmailExists) {
      //if email not exist (false)
      res.send({ ok: false, massage: "Email not exist" });
    } else {
      //encode password with bcrypt.js
      const hash = await bcrypt.hash(password, saltRounds);
      console.log("hash:", hash);

      const userDB = await findOneAndUpdateDataOnMongoDB(
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
