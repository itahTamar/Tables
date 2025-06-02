"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userCont_1 = require("./userCont");
const router = express_1.default.Router();
router
    .post('/login', userCont_1.connectUser) //work
    .post("/register", userCont_1.addUser) //work
    .post('/addUserField', userCont_1.addUserField) //work
    .post("/resetPassword", userCont_1.resetUserPassword)
    .get('/getUser/:userId', userCont_1.getUser) //work
    .patch("/updateUserDetails/:userID", userCont_1.updateUserFieldsValue) //work
    .patch('/updateUserEmailAndPassword', userCont_1.updateUserEmailAndPassword)
    .delete("/deleteUser", userCont_1.deleteUser)
    .delete('/deleteUserField', userCont_1.deleteUserField); //work
exports.default = router;
//# sourceMappingURL=userRoutes.js.map