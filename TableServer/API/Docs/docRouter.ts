import express from "express";
import { addDoc, deleteDoc, getDoc, getDocs, updateDoc } from "./docsControllers";

const router = express.Router();

router
  .post("/addDoc", addDoc) //work
  .get("/getDoc", getDocs) //work
  .patch("/updateDoc", updateDoc) //work
  .delete("/deleteDoc", deleteDoc) //work

export default router;