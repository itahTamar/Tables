import  express  from 'express';
import { addTablesColumn, deleteTablesColumns, getAllTablesColumns } from './tablesColumnControllers';
const router = express.Router();

router
.post('/addTablesColumn/:tableId',addTablesColumn)
.post('/getAllTablesColumns/:tableId',getAllTablesColumns)
.delete('/deleteTablesColumns/:tableId',deleteTablesColumns)


export default router;