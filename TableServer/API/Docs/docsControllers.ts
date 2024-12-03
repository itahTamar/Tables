import { MongoDBWrapper } from "../../mongoDB/nativeDriver/mongoDBWrapper";

//!create doc
export async function addDoc(req: any, res: any) {
    try {
      const {collectionName} = req.body
      const {document} = req.body

      if(!collectionName || ! document) throw new Error("no collectionName or document");
      
      // Save the new Cell to MongoDB
      const response = await MongoDBWrapper.create(collectionName, document);
      console.log("At addDoc the response:", response);
      if (!response)
        throw new Error(
          "at addDoc Fails to save new doc"
        );
      res.send(response);
    } catch (error) {
      console.error("Error in addDoc:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } //work ok