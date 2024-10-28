import express from 'express'
import { registerUser, login, resetPassword, updateUserDetails, deleteUser  } from './userCont';
const router = express.Router();

router
    .post('/login',login)
    .post("/register", registerUser)
    .post("/resetPassword", resetPassword)
    .patch("/updateUserDetails", updateUserDetails)
    .delete("/deleteUser", deleteUser)
  
export default router;