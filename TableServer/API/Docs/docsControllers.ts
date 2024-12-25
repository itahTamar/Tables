import { MongoDBWrapper } from "../../mongoDB/nativeDriver/mongoDBWrapper";
import { ObjectId } from "mongodb";

//!create doc
export async function addDoc(req: any, res: any) {
  try {
    const { collectionName } = req.body;
    const { document } = req.body;

    if (!collectionName || !document)
      throw new Error("no collectionName or document");

    // Save the new doc to MongoDB
    const response = await MongoDBWrapper.createDocument(
      collectionName,
      document
    );
    console.log("At addDoc the response:", response); //=>{acknowledged, insertedId}
    if (!response) throw new Error("at addDoc Fails to save new doc");
    res.send(response);
  } catch (error) {
    console.error("Error in addDoc:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} //work ok

//!delete doc
export async function deleteDoc(req: any, res: any) {
  try {
    const { collectionName } = req.body;
    const { query } = req.body;

    if (!collectionName || !query)
      throw new Error("no collectionName or query");
    console.log("At deleteDoc the query is:", query);

    // Convert _id to ObjectId if it exists in the query
    if (query._id && typeof query._id === "string") {
      query._id = new ObjectId(query._id);
    }

    // delete the doc to MongoDB
    const response = await MongoDBWrapper.deleteDocument(collectionName, query);
    console.log("At deleteDoc the response:", response);
    if (!response) throw new Error("at deleteDoc Fails to save new doc");
    res.send(response);
  } catch (error) {
    console.error("Error in deleteDoc:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} //work ok

//!update doc
export async function updateDoc(req: any, res: any) {
  try {
    const { collectionName } = req.body;
    const { query } = req.body;
    const { update } = req.body;

    if (!collectionName || !query || !update)
      throw new Error("no collectionName or query or update");

    // Convert _id to ObjectId if it exists in the query
    if (query._id && typeof query._id === "string") {
      query._id = new ObjectId(query._id);
    }

    // update the doc to MongoDB
    const response = await MongoDBWrapper.updateDocument(
      collectionName,
      query,
      update
    );
    console.log("At updateDoc the response:", response);
    if (!response) throw new Error("at updateDoc Fails to save new doc");
    res.send(response);
  } catch (error) {
    console.error("Error in updateDoc:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} //work ok

export async function updateDocs(req: any, res: any) {
  try {
    const { collectionName } = req.body;
    const { query } = req.body;
    const { update } = req.body;

    if (!collectionName || !query || !update)
      throw new Error("no collectionName or query or update");

    // Convert _id to ObjectId if it exists in the query
    if (query._id && typeof query._id === "string") {
      query._id = new ObjectId(query._id);
    }

    // update the documents to MongoDB
    const response = await MongoDBWrapper.updateDocuments(
      collectionName,
      query,
      update
    );
    console.log("At updateDoc the response:", response);
    if (!response) throw new Error("at updateDoc Fails to save new doc");
    res.send(response);
  } catch (error) {
    console.error("Error in updateDoc:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

//!get one doc - not in use
export async function getDoc(req: any, res: any) {
  try {
    const { collectionName } = req.query;
    const { query } = req.query;

    console.log("At getDoc the collectionName is:", collectionName);
    console.log("At getDoc the query is:", query);

    if (!collectionName || !query)
      throw new Error("no collectionName or query");

    const parsedQuery = JSON.parse(query); // Parse query from string to object
    console.log("Parsed query:", parsedQuery);

    // Convert _id to ObjectId if it exists in the query
    if (parsedQuery._id && typeof parsedQuery._id === "string") {
      parsedQuery._id = new ObjectId(parsedQuery._id);
    }

    // read the doc from MongoDB
    const response = await MongoDBWrapper.readDocument(
      collectionName,
      parsedQuery
    );
    console.log("At getDoc the response:", response);
    if (!response) throw new Error("at getDoc Fails to save new doc");
    res.send(response);
  } catch (error) {
    console.error("Error in getDoc:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} //work ok

//!get one/all doc
export async function getDocs(req: any, res: any) {
  try {
    const { collectionName } = req.query;
    const { query } = req.query;

    console.log("At getDoc the collectionName is:", collectionName);
    console.log("At getDoc the query is:", query);

    if (!collectionName || !query)
      throw new Error("no collectionName or query");

    const parsedQuery = JSON.parse(query); // Parse query from string to object
    console.log("Parsed query:", parsedQuery);

    // Check if the middleware added `req.user`
    if (req.user?.userId) {
      console.log("User ID from middleware:", req.user.userId);

      // Add the userId to the query if required
      parsedQuery.userId = req.user.userId;
    }

    // Convert _id to ObjectId if it exists in the query
    if (parsedQuery._id && typeof parsedQuery._id === "string") {
      parsedQuery._id = new ObjectId(parsedQuery._id);
    }

    // read the doc from MongoDB
    const response = await MongoDBWrapper.readDocuments(
      collectionName,
      parsedQuery
    );
    console.log("At getDoc the response:", response);
    if (!response) throw new Error("at getDoc Fails to save new doc");
    res.send(response);
  } catch (error) {
    console.error("Error in getDoc:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} //work ok

//!get search result
export async function searchDocsAggPip(req: any, res: any) {
  try {
    console.log("At searchDocsAggPip");

    const { collectionName, tableIndex, regexToSearch } = req.query;
    console.log(
      "At searchDocsAggPip collectionName, tableIndex, regexToSearch:",
      collectionName,
      tableIndex,
      regexToSearch
    );

    if (!collectionName || tableIndex === undefined || !regexToSearch) {
      throw new Error(
        "Missing required fields: collectionName, tableIndex, or regexToSearch"
      );
    }

    console.log("Inputs:", { collectionName, tableIndex, regexToSearch });

    // Convert tableIndex to a number (because in the query it came as a string!)
    const tableIndexNumber = parseInt(tableIndex, 10);
    if (isNaN(tableIndexNumber)) {
      throw new Error("Invalid tableIndex: must be a number");
    }

    console.log("Inputs:", {
      collectionName,
      tableIndex: tableIndexNumber,
      regexToSearch,
    });

    // Aggregation pipeline
    const pipeline = [
      { $match: { tableIndex: tableIndexNumber } },
      {
        $match: {
          data: {
            $regex: regexToSearch,
            $options: "i",
          },
        },
      }, // Regex search
      {
        $match: {
          data: {
            $not: /^data:image\//,
          },
        },
      }, // Exclude images
    ];

    const firstResult = await MongoDBWrapper.searchDocumentsAggPip(
      collectionName,
      pipeline
    );
    console.log("First result:", firstResult);

    // Extract unique rowIndexes
    const rowIndexSet = new Set(
      firstResult
        .map((doc) => doc.rowIndex)
        .filter((rowIndex) => rowIndex !== undefined)
    );
    console.log("Unique rowIndexes:", Array.from(rowIndexSet));

    // Fetch documents for each unique rowIndex
    const finalResults = await Promise.all(
      Array.from(rowIndexSet).map((rowIndex) =>
        MongoDBWrapper.readDocuments(collectionName, { rowIndex }).then(
          (documents) => ({ documents })
        )
      )
    );

    res.status(200).send(finalResults);
  } catch (error) {
    console.error("Error in searchDocsAggPip:", error.message);
    res
      .status(500)
      .json({
        message: error.message || "Internal server error in searchDocsAggPip",
      });
  }
} //work ok
