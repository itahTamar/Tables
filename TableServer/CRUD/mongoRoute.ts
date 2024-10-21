import express from 'express'
import { getAllData, isEmailExist } from '../API/dataControllers';

const router = express.Router();

router
.get('/getAllData', getAllData)  
.get('/isEmailExist', isEmailExist)
export default router;