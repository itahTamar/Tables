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
exports.extractCookie = void 0;
exports.isItemExist = isItemExist;
const mongoCRUD_1 = require("../mongoDB/mongoose/mongoCRUD/withMongoose/mongoCRUD");
const jwt_simple_1 = __importDefault(require("jwt-simple"));
//help functions:
function isItemExist(modelName, item) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("isItemExist function");
            console.log("At isItemExist item:", item);
            const dataDB = yield (0, mongoCRUD_1.getOneDataFromMongoDB)(modelName, item);
            console.log("At isItemExist dataDB:", dataDB);
            console.log("At isItemExist dataDB.ok:", dataDB.ok);
            return dataDB.ok;
        }
        catch (error) {
            console.error(error);
            return error;
        }
    });
} //work ok
const extractCookie = (req, res, next) => {
    try {
        console.log("Request Cookies:", req.cookies);
        const userID = req.cookies.user; //unique id. get the user id from the cookie - its coded!
        if (!userID)
            throw new Error("At extractCookie: userID not found in cookie");
        console.log("At extractCookie the userID from cookies: ", {
            userID,
        });
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error("At extractCookie: Couldn't load secret from .env");
        const decodedUserId = jwt_simple_1.default.decode(userID, secret);
        console.log("At extractCookie the decodedUserId:", decodedUserId);
        // Attach the decoded user ID to the req object
        req.user = decodedUserId;
        next(); // Pass control to the next middleware/handler
    }
    catch (error) {
        console.error("Error in extractCookie middleware:", error.message);
        res.status(401).send({ error: "Unauthorized access" });
    }
}; //work ok
exports.extractCookie = extractCookie;
//# sourceMappingURL=helpFunctions.js.map