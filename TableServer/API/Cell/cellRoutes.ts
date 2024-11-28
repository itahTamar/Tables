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
  .post("/addCell", addCell) //work
  .post("/addCellField", addCellField) //work
  .get("/getCell/:cellId", getCell) //work
  .get("/getAllCells", getAllCells) //work
  .patch("/updateCellFieldsValue/:cellId", updateCellFieldsValue) //work
  .delete("/deleteCellsField", deleteCellsField)
  .delete("/deleteCell/:cellId", deleteCell); //work

export default router;
