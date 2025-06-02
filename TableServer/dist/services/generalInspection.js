"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCookieValid = checkCookieValid;
const jwt_simple_1 = __importDefault(require("jwt-simple"));
function checkCookieValid(req) {
    try {
        //get user id from cookie
        const someID = req.cookies.id; //unique id. get the user id from the cookie - its coded!
        if (!someID)
            throw new Error("At generalInspection checkCookieValid: userID not found in cookie");
        console.log("At checkCookieValid the userID from cookies: ", { someID }); //work ok
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error("At generalInspection checkCookieValid: Couldn't load secret from .env");
        const decodedId = jwt_simple_1.default.decode(someID, secret);
        console.log("At generalInspection checkCookieValid the decodedUserId:", decodedId); //work ok
        return decodedId;
    }
    catch (error) {
        console.error(error);
    }
}
//# sourceMappingURL=generalInspection.js.map