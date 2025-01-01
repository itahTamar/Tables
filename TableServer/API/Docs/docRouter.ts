import express from "express";
import { addDoc, deleteDoc, deleteDocs, getDocs, updateDocs } from "./docsControllers";
import { extractCookie } from "../helpFunctions";
import { deleteTablesDocuments, searchDocsAggPip } from "./specificTablesControllers";

const router = express.Router();

router
  .post("/addDoc", addDoc) //work
  .post("/addNewUsersTable", extractCookie, addDoc) //work
  .get("/getDoc", getDocs) //work
  .get("/getUserDocs", extractCookie, getDocs) //work
  .get("/searchDocsAggPip", extractCookie, searchDocsAggPip) //work
  .patch("/updateDoc", updateDocs) //work
  .delete("/deleteDoc", deleteDoc) //work
  .delete("/deleteTablesDocs", deleteTablesDocuments) //work

export default router;