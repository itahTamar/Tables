
import express from 'express';
import { addNewRowData, deleteRowDataById, getAllData, updateFieldByDataId } from './dataControllers';
const router = express.Router();

router
.get('/getAllData', getAllData)
.post('/addNewRowData', addNewRowData)
.patch('/updateFieldByDataId/:dataID', updateFieldByDataId)
.delete('/deleteRowDataById/:dataID', deleteRowDataById)

export default router;