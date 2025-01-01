import { MongoDBWrapper } from "../../mongoDB/nativeDriver/mongoDBWrapper";
import { ObjectId } from "mongodb";
import { deleteDoc, deleteDocs } from "./docsControllers";

//!get search result
export async function searchDocsAggPip(req: any, res: any) {
  try {
    console.log("At searchDocsAggPip");

    const { collectionName, tableId, regexToSearch } = req.query;
    console.log(
      "At searchDocsAggPip collectionName, tableIndex, regexToSearch:",
      collectionName,
      tableId,
      regexToSearch
    );

    if (!collectionName || tableId === undefined || !regexToSearch) {
      throw new Error(
        "Missing required fields: collectionName, tableIndex, or regexToSearch"
      );
    }

    console.log("Inputs:", { collectionName, tableId, regexToSearch });

    //step 1: Aggregation pipeline for the cell search
    const pipeline = [
      { $match: { tableId, type: "cell" } },
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
    console.log("First result:", firstResult); //!till here works ok

    //step 2: Extract unique rowIndexes
    const rowIndexSet = new Set(
      firstResult
        .map((doc) => doc.rowIndex)
        .filter((rowIndex) => rowIndex !== undefined)
    );
    console.log("Unique rowIndexes:", Array.from(rowIndexSet));

    // Step 3: Fetch documents for all unique rowIndexes in the same tableId
    const rowIndexArray = Array.from(rowIndexSet); // Convert Set to Array
    console.log("Row Index Array for Step 3:", rowIndexArray);

    const rowPipeline = [
      {
        $match: {
          tableId, // Match the same tableId
          rowIndex: { $in: rowIndexArray }, // Match any rowIndex in the set
        },
      },
      {
        $match: {
          type: "cell", // Optional: Ensure only 'cell' type documents
        },
      },
    ];

    const finalResults = await MongoDBWrapper.searchDocumentsAggPip(
      collectionName,
      rowPipeline
    );
    console.log("finalResults Step 3:", finalResults);

    res.status(200).json(finalResults);
  } catch (error) {
    console.error("Error in searchDocsAggPip:", error.message);
    res.status(500).json({
      message: error.message || "Internal server error in searchDocsAggPip",
    });
  }
} //work ok

//!delete table - splits the req into two streams for deleting all table's related documents
export async function deleteTablesDocuments(req: any, res: any) {
  try {
    const { query } = req.body;
    const {collectionName} = req.body
    if (!query || !query._id || ! collectionName)
      throw new Error("At deleteTablesDocuments no query or collectionName");
    console.log("At deleteTablesDocuments the query is:", query);
    console.log("At deleteTablesDocuments the collectionName is:", collectionName);

    //step 1: delete all table's cells/columns type document by tableId field
    const tableId = query._id;
    const newQuery = { tableId: tableId };
    const response1 = await MongoDBWrapper.deleteDocuments(collectionName, newQuery); 
    if (!response1.acknowledged) {
      throw new Error("Failed to delete associated cell documents.");
    }

    //step 2: delete the table type document by it's id
    // Convert _id to ObjectId if it exists in the query
    if (query._id && typeof query._id === "string") {
        query._id = new ObjectId(query._id);
      }

    const response2 = await MongoDBWrapper.deleteDocument(collectionName, query); 
    if (!response2.acknowledged) {
      throw new Error("Failed to delete the table document.");
    }

    res.send(response2)
  } catch (error) {
    console.error("Error in deleteTablesDocuments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} //work ok
