import  express  from 'express';
import { addTable, deleteTable, getAllTables } from './tableControllers';
const router = express.Router();

router
.post('/addNewTable', addTable)
.get('/getAllTables', getAllTables)
.delete('/deleteTable/:tableId/:fieldOfInterest', deleteTable)

export default router;