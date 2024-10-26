import  express  from 'express';
import { addNewTable, deleteTable, getAllTableRowData } from './tableControllers';
const router = express.Router();

router
.post('/addNewTable', addNewTable)
.get('/getAllTableRowData', getAllTableRowData)
.delete('/deleteTable', deleteTable)

export default router;