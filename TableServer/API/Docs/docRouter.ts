import express from "express";
import { addDoc, deleteDoc, getDocs, searchDocsAggPip, updateDocs } from "./docsControllers";
import { extractCookie } from "../helpFunctions";

const router = express.Router();

router
  .post("/addDoc", addDoc) //work
  .post("/addNewUsersTable", extractCookie, addDoc)
  .get("/getDoc", getDocs) //work
  .get("/getUserDocs", extractCookie, getDocs) //work
  .get("/searchDocsAggPip", searchDocsAggPip) //work
  .patch("/updateDoc", updateDocs) //work
  .delete("/deleteDoc", deleteDoc) //work

export default router;