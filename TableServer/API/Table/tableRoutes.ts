import  express  from 'express';
import { addNewTable, deleteTable, getAllTableRowData } from './tableControllers';
const router = express.Router();

router
.post('/addNewTable', addNewTable)
.get('/getAllTableRowData/:tableId', getAllTableRowData)
.delete('/deleteTable/:tableId/:fieldOfInterest', deleteTable)

export default router;