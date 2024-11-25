import  express  from 'express';
import { addColumnsCell, deleteColumnsCells, getAllColumnsCells } from './columnsCellsControllers';
const router = express.Router();

router
.post('/addColumnsCell/:columnID',addColumnsCell)
.post('/getAllColumnsCells/:columnID',getAllColumnsCells)
.delete('/deleteColumnsCells/:columnID',deleteColumnsCells)


export default router;