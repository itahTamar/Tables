import  express  from 'express';
import { addTable, addTableField, deleteTable, deleteTableField, getAllTables, getTable, updateTableFieldsValue } from './tableControllers';
const router = express.Router();

router
.post('/addTable', addTable)  //work
.post('/addTableField',addTableField) //work
.get('/getTable/:tableId',getTable) //work
.get('/getAllTables',getAllTables) //work
.patch('/updateTableFieldsValue/:tableID',updateTableFieldsValue) //work
.delete('/deleteTable/:tableId/:fieldOfInterest', deleteTable)
.delete('/deleteTableField',deleteTableField) //?
 
export default router;