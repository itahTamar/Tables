import  express  from 'express';
import { addTable, addTableField, deleteTable, deleteTableField, getTable, updateTableFieldsValue } from './tableControllers';
const router = express.Router();

router
.post('/addTable', addTable)
.post('/addTableField',addTableField)
.get('/getTable/:tableId',getTable)
.patch('/updateTableFieldsValue/tableID:',updateTableFieldsValue)
.delete('/deleteTable/:tableId/:fieldOfInterest', deleteTable)
.delete('/deleteTableField',deleteTableField)

export default router;