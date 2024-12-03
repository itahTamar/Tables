import express from "express";
import { addDoc, deleteDoc, getDoc, updateDoc } from "./docsControllers";

const router = express.Router();

router
  .post("/addDoc", addDoc) //work
  .get("/getDoc", getDoc) //work
  .patch("/updateDoc", updateDoc) //work
  .delete("/deleteDoc", deleteDoc) //work

export default router;