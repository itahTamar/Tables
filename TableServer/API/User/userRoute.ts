import express from 'express'
import { registerUser, login, resetPassword, UpdateUserDetails  } from './userCont';
//import { isAdmin } from './middelware/users';
const router = express.Router();

router
    .post('/login',login)
    .post("/register", registerUser)
    .post("/resetPassword", resetPassword)
    .post("/UpdateUserDetails", UpdateUserDetails)
  
export default router;