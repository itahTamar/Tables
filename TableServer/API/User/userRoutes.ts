import express from 'express'
import { addUser, connectUser, deleteUser, resetUserPassword, updateUserFieldValue  } from './userCont';
const router = express.Router();

router
    .post('/login',connectUser)
    .post("/register", addUser)
    .post("/resetPassword", resetUserPassword)
    .patch("/updateUserDetails", updateUserFieldValue)
    .delete("/deleteUser", deleteUser)
  
export default router;