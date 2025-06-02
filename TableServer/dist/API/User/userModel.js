"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.UserModel = exports.userSchema = exports.User = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
class User {
    constructor({ userName, password }) {
        this.password = password;
        this.role = "user";
        this.email = "none";
    }
    setRole(role) {
        this.role = role;
    }
}
exports.User = User;
//define a schema (It is like interface in typescript)
exports.userSchema = new mongoose_2.default.Schema({
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    email: { type: String, default: "none", unique: true },
}, { bufferCommands: false });
exports.UserModel = (0, mongoose_1.model)("users", exports.userSchema);
exports.users = [];
//"users" is the name of the collection in the DB
//# sourceMappingURL=userModel.js.map