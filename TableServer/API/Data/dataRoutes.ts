
import express from 'express';
import { addNewColumn, addNewRowData, deleteRowDataById, updateFieldByDataId } from './dataControllers';
const router = express.Router();

router
.post('/addNewRowData/:tableId', addNewRowData)
.patch('/updateFieldByDataId/:dataID', updateFieldByDataId)
.patch('/addNewColumn/:tableId', addNewColumn)
.delete('/deleteRowDataById/:dataID', deleteRowDataById)

export default router;