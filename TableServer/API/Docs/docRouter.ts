import express from "express";
import { addDoc, bulkDeleteDocs, bulkUpdateDocs, deleteDoc, deleteDocs, getDocs, updateDocs } from "./docsControllers";
import { extractCookie } from "../helpFunctions";
import { deleteTablesDocuments, exportTableAsCSV, searchDocsAggPip } from "./specificTablesControllers";

const router = express.Router();

router
  .post("/addDoc", addDoc) //work
  .post("/addNewUsersTable", extractCookie, addDoc) //work
  .get("/getDoc", getDocs) //work
  .get("/getUserDocs", extractCookie, getDocs) //work
  .get("/searchDocsAggPip", extractCookie, searchDocsAggPip) //work
  .get("/export/csv/:tableId", exportTableAsCSV)
  .patch("/updateDocs", updateDocs) //
  .delete("/deleteDoc", deleteDoc) //work
  .delete("/deleteTablesDocs", deleteTablesDocuments) //work
  .patch("/bulkUpdateDocs", bulkUpdateDocs)
  .delete("/bulkDeleteDocs", bulkDeleteDocs);


export default router;