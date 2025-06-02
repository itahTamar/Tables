"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectUser = exports.resetUserPassword = exports.addUser = void 0;
exports.addUserField = addUserField;
exports.getUser = getUser;
exports.getAllUsers = getAllUsers;
exports.updateUserFieldsValue = updateUserFieldsValue;
exports.deleteUser = deleteUser;
exports.deleteUserField = deleteUserField;
exports.updateUserEmailAndPassword = updateUserEmailAndPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const mongoCRUD_1 = require("../../mongoDB/mongoose/mongoCRUD/withMongoose/mongoCRUD");
const helpFunctions_1 = require("../helpFunctions");
const userModel_1 = require("./userModel");
const mongoose_1 = __importDefault(require("mongoose"));
const { JWT_SECRET } = process.env;
const secret = JWT_SECRET;
const saltRounds = 10;
//!create
//register user
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("hello from server registerUser");
        const { email, password } = req.body;
        console.log({ password }, { email });
        if (!password || !email)
            throw new Error("At userCont-registerUser complete all fields");
        //check if email exist already, if so reject the registration
        // @ts-ignore
        const emailExists = yield (0, helpFunctions_1.isItemExist)(userModel_1.UserModel, { email: email }); // Await the result
        if (emailExists) {
            //if email exist (true)
            res.send({ ok: false, massage: "Email exist" });
        }
        else {
            //encode password with bcrypt.js
            const hash = yield bcrypt_1.default.hash(password, saltRounds);
            const user = new userModel_1.UserModel({ email, password: hash });
            const userDB = yield user.save(); //if there is problem saving in DB it catch the error
            console.log(userDB);
            if (userDB) {
                res.send({ ok: true });
            }
            else {
                res.send({ ok: false });
            }
        }
    }
    catch (error) {
        console.error(error);
        res.send({ ok: false, error: "server error at register-user" });
    }
}); //work ok
exports.addUser = addUser;
//add new field to all users
function addUserField(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fieldName = req.body.fieldName;
            if (!fieldName)
                throw new Error("At addUserField no fieldName found");
            yield (0, mongoCRUD_1.addFieldToSchemaAndMongoDB)(userModel_1.UserModel, fieldName, " ");
            res.send({ ok: true, massage: "documents were updated with the field" });
        }
        catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
} //work ok
//!read
//get one user
function getUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = new mongoose_1.default.Types.ObjectId(String(req.params.userId));
            if (!userId)
                throw new Error("at getUser no userId found");
            const user = yield (0, mongoCRUD_1.getOneDataFromMongoDB)(userModel_1.UserModel, userId);
            if (user.ok) {
                res.send(user.response); //return the user data
            }
            else {
                res.send(user.ok); //return false
            }
        }
        catch (error) {
            console.error(error);
        }
    });
} //work ok
// get all users
function getAllUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("getAllUsers function");
            const dataDB = yield (0, mongoCRUD_1.getAllDataFromMongoDB)(userModel_1.UserModel);
            console.log("At getAllUsers dataDB:", dataDB);
            res.send({ data: dataDB }); //send to client the users information
        }
        catch (error) {
            console.error(error);
        }
    });
} //not in use
//!update 
function updateUserFieldsValue(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userID = req.params.userID;
            if (!userID)
                throw new Error("no word id in params updateWord");
            console.log("at updateUserFieldsValue the userID:", userID);
            const { field } = req.body;
            console.log("at updateUserFieldsValue the field:", field); //ok
            const { updateData } = req.body;
            if (!field || !updateData)
                throw new Error("missing data required field or updateData");
            const update = { [field]: updateData };
            console.log("at updateUserFieldsValue the update:", update);
            //find the word in DB by word_id and update the require field
            const newUpdated = yield (0, mongoCRUD_1.updateDataOnMongoDB)(userModel_1.UserModel, { _id: userID }, update);
            console.log("at updateUserFieldsValue the newUpdated", newUpdated);
            res.send(newUpdated);
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ error: error.message });
        }
    });
} // work ok
//!delete
//delete user by email and password
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email || !password)
                throw new Error("please fill all");
            //check if user exist and password is correct
            const userDB = yield userModel_1.UserModel.findOne({ email });
            console.log("At deleteUser the userDB:", userDB);
            if (!userDB)
                throw new Error("some of the details are incorrect");
            const { password: hash } = userDB;
            if (!hash)
                throw new Error("some of the details are incorrect");
            //check if hash password is equal to the password that the user entered
            const match = yield bcrypt_1.default.compare(password, hash);
            if (!match)
                throw new Error("some of the details are incorrect");
            yield (0, mongoCRUD_1.deleteOneDataFromMongoDB)(userModel_1.UserModel, { email });
            res.send({ ok: true });
        }
        catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
} //work ok
//delete field from all users
function deleteUserField(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fieldName = req.body.fieldName;
            if (!fieldName)
                throw new Error("At deleteUserField no fieldName found");
            yield (0, mongoCRUD_1.deleteFieldFromSchemaAndMongoDB)(userModel_1.UserModel, fieldName);
            res.send({
                ok: true,
                massage: "field successfully deleted from all documents",
            });
        }
        catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
} //?
//! uniq functions for users
//update email and password 
function updateUserEmailAndPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { oldEmail, oldPassword, newEmail, newPassword } = req.body;
            if (!oldEmail || !oldPassword || !newEmail || !newPassword)
                throw new Error("please fill all");
            console.log("At updateUserDetails the oldEmail:", oldEmail);
            console.log("At updateUserDetails the oldPassword:", oldPassword);
            console.log("At updateUserDetails the newEmail:", newEmail);
            console.log("At updateUserDetails the newPassword:", newPassword);
            //check if user exist and password is correct
            const userDB = yield userModel_1.UserModel.findOne({ email: oldEmail });
            console.log("At updateUserDetails the userDB:", userDB);
            if (!userDB)
                throw new Error("some of the details are incorrect");
            const { password: hash } = userDB;
            if (!hash)
                throw new Error("some of the details are incorrect");
            //check if hash password is equal to the password that the user entered
            const match = yield bcrypt_1.default.compare(oldPassword, hash);
            if (!match)
                throw new Error("some of the details are incorrect");
            const updatedUser = yield (0, mongoCRUD_1.updateDataOnMongoDB)(userModel_1.UserModel, { email: oldEmail }, //search the doc by the old-email
            {
                //update thous fields
                email: newEmail,
                password: yield bcrypt_1.default.hash(newPassword, 10), // Hash the new password before saving
            });
            console.log("At updateUserDetails the newUserDB:", updatedUser);
            res.send({ ok: true, updatedUser });
        }
        catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
} //work ok
//reset user password
const resetUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Hello from server resetPassword");
        const { email, password } = req.body;
        console.log({ password }, { email });
        if (!password || !email)
            throw new Error("At userCont-resetPassword complete all fields");
        //check if email exist , if so update the user password
        //@ts-ignore
        const isEmailExists = yield (0, helpFunctions_1.isItemExist)(userModel_1.UserModel, {
            item: email,
        }); // Await the result
        console.log("at resetPassword the isEmailExists answer is:", isEmailExists);
        if (!isEmailExists) {
            //if email not exist (false)
            res.send({ ok: false, massage: "Email not exist" });
        }
        else {
            //encode password with bcrypt.js
            const hash = yield bcrypt_1.default.hash(password, saltRounds);
            console.log("hash:", hash);
            const userDB = yield (0, mongoCRUD_1.updateDataOnMongoDB)(userModel_1.UserModel, { email }, { password: hash });
            console.log("userDB:", userDB);
            if (userDB) {
                res.send({ ok: true });
            }
            else {
                res.send({ ok: false });
            }
        }
    }
    catch (error) {
        console.error(error);
        res.send({ ok: false, error: "server error at register-user" });
    }
}); //work ok
exports.resetUserPassword = resetUserPassword;
//login user
const connectUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log("At userCont login:", { email, password });
        if (!password || !email)
            throw new Error("At userCont login: complete all fields");
        //check if user exist and password is correct
        const userDB = yield userModel_1.UserModel.findOne({ email });
        if (!userDB)
            throw new Error("At userCont login: some of the details are incorrect");
        const { password: hash } = userDB;
        if (!hash)
            throw new Error("At userCont login: some of the details are incorrect");
        //check if hash password is equal to the password that the user entered
        const match = yield bcrypt_1.default.compare(password, hash);
        if (!match)
            throw new Error("At userCont login: some of the details are incorrect");
        //create and encode cookie with JWT
        // encode
        const JWTCookie = jwt_simple_1.default.encode(userDB._id, secret); //the id given by mongo is store in the cookie - encoded!
        console.log("At userCont login JWTCookie:", JWTCookie); //got it here!
        const isProd = process.env.MODE_ENV === "production";
        console.log("isProd =", isProd);
        res.cookie("user", JWTCookie, {
            // httpOnly: true,  //makes the cookie inaccessible via JavaScript on the client side. It won't show up in document.cookie or the browser's developer tools.
            path: "/", // Set the path to root to make it available across the entire site
            sameSite: isProd ? "None" : "Lax", //! "None" for PROD, "Lax" for DEV
            secure: isProd, //! true for PROD, false for DEV
            maxAge: 1000 * 60 * 60 * 24, //1 day
        }); //send the cookie to client
        res.send({ ok: true });
    }
    catch (error) {
        console.error(error);
        res.status(401).send({ error });
    }
}); //work ok
exports.connectUser = connectUser;
//# sourceMappingURL=userCont.js.map