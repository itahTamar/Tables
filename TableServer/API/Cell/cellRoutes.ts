import express from "express";
import {
  addCell,
  addCellField,
  deleteCell,
  deleteCellsField,
  getAllCells,
  getCell,
  updateCellFieldsValue,
} from "./cellControllers";
const router = express.Router();

router
  .post("/addCell", addCell)
  .post("/addCellField", addCellField)
  .get("/getCell/:cellId", getCell)
  .get("/getAllCells", getAllCells)
  .patch("/updateCellFieldsValue/:cellId", updateCellFieldsValue)
  .delete("/deleteCellsField", deleteCellsField)
  .delete("/deleteCell/:cellId", deleteCell);

export default router;
