const router = express.Router();
import { express } from 'express';
import { addCellField, deleteCellsField, getCell, updateCellFieldsValue } from './cellControllers';

router
  .post('/addCellField',addCellField)
  .get('/getCell/:cellId',getCell)
  .patch('/updateCellFieldsValue/:cellId',updateCellFieldsValue)
  .delete('/deleteCellsField', deleteCellsField);

export default router;