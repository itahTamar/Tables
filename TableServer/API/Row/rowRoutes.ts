import express from "express";
import {
  addNewColumn,
  addNewRowData,
  deleteRowDataById,
  renameColumn,
  updateFieldByDataId,
} from "./rowControllers";
const router = express.Router();

router
  .post("/addNewRowData/:tableId", addNewRowData)
  .patch("/updateFieldByDataId/:dataID", updateFieldByDataId)
  .patch("/addNewColumn/:tableId", addNewColumn)
  .patch("/renameColumn/:tableId", renameColumn)
  .delete("/deleteRowDataById/:dataID", deleteRowDataById);

export default router;
