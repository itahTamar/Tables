
import express from 'express';
import { addNewRowData, deleteRowDataById, 
    // getAllData,
     updateFieldByDataId } from './dataControllers';
const router = express.Router();

router
.post('/addNewRowData/:tableId', addNewRowData)
// .get('/getAllData', getAllData)
.patch('/updateFieldByDataId/:dataID', updateFieldByDataId)
.delete('/deleteRowDataById/:dataID', deleteRowDataById)

export default router;