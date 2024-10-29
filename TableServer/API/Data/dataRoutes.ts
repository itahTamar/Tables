
import express from 'express';
import { addNewRowData, deleteRowDataById, updateFieldByDataId } from './dataControllers';
const router = express.Router();

router
.post('/addNewRowData/:tableId', addNewRowData)
.patch('/updateFieldByDataId/:dataID', updateFieldByDataId)
.delete('/deleteRowDataById/:dataID', deleteRowDataById)

export default router;