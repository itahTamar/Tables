import express from "express";
import { addDoc, deleteDoc, getDocs, searchDocsAggPip, updateDocs } from "./docsControllers";

const router = express.Router();

router
  .post("/addDoc", addDoc) //work
  .get("/getDoc", getDocs) //work
  .get("/searchDocsAggPip", searchDocsAggPip) //work
  .patch("/updateDoc", updateDocs) //work
  .delete("/deleteDoc", deleteDoc) //work

export default router;