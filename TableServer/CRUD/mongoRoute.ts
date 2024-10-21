import express from 'express'
import { getAllData } from '../API/dataControllers';

const router = express.Router();

router
.get('/getAllData',getAllData)  

export default router;