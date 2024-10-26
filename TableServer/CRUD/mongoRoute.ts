import express from 'express'
import { getAllData } from '../API/Data/dataControllers';
import { isEmailExist } from '../API/User/userCont';

const router = express.Router();

router
.get('/getAllData', getAllData)  
.get('/isEmailExist', isEmailExist)
export default router;