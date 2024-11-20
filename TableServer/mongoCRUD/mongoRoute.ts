import express from 'express'
import { isEmailExist } from '../API/User/userCont';

const router = express.Router();

router
.get('/isEmailExist', isEmailExist)
export default router;