import express from "express";
import { addDoc } from "./docsControllers";

const router = express.Router();

router
  .post("/addDoc", addDoc) //work
  // .post()
  // .get() 
  // .get() 
  // .patch()
  // .delete()
  // .delete(); 

export default router;