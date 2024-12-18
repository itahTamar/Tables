import express from 'express'
import { addUser, addUserField, connectUser, deleteUser, deleteUserField, getUser, resetUserPassword, updateUserEmailAndPassword, updateUserFieldsValue  } from './userCont';
const router = express.Router();

router
    .post('/login',connectUser) //work
    .post("/register", addUser) //work
    .post('/addUserField', addUserField) //work
    .post("/resetPassword", resetUserPassword)
    .get('/getUser/:userId',getUser) //work
    .patch("/updateUserDetails/:userID", updateUserFieldsValue) //work
    .patch('/updateUserEmailAndPassword',updateUserEmailAndPassword)
    .delete("/deleteUser", deleteUser)
    .delete('/deleteUserField',deleteUserField) //work
  
export default router;