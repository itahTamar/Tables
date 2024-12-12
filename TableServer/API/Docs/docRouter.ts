import express from "express";
import { addDoc, deleteDoc, getDoc, getDocs, updateDoc, updateDocs } from "./docsControllers";
import { searchDocsAggPip } from "../helpFunctions";

const router = express.Router();

router
  .post("/addDoc", addDoc) //work
  .get("/getDoc", getDocs) //work
  .get("/searchDocsAggPip", searchDocsAggPip)
  .patch("/updateDoc", updateDocs) //work
  .delete("/deleteDoc", deleteDoc) //work

export default router;