import  express  from 'express';
import { addNewTable, deleteTable, getAllTables, getAllTableRowData } from './tableControllers';
const router = express.Router();

router
.post('/addNewTable', addNewTable)
.get('/getAllTableRowData/:tableId', getAllTableRowData)
.get('/getAllTables', getAllTables)
.delete('/deleteTable/:tableId/:fieldOfInterest', deleteTable)

export default router;