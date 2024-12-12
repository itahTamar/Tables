import { Model } from "mongoose";
import { getOneDataFromMongoDB } from "../mongoDB/mongoose/mongoCRUD/withMongoose/mongoCRUD";
import { MongoDBWrapper } from "../mongoDB/nativeDriver/mongoDBWrapper";

//help functions:
export async function isItemExist<T extends Document>(
  modelName: Model<T>,
  item: Partial<T>
): Promise<boolean> {
  try {
    console.log("isItemExist function");
    console.log("At isItemExist item:", item);
    const dataDB = await getOneDataFromMongoDB<any>(modelName, {
      filterCriteria: item,
    });
    console.log("At isItemExist dataDB:", dataDB);
    console.log("At isItemExist dataDB.ok:", dataDB.ok);
    return dataDB.ok;
  } catch (error) {
    console.error(error);
    return error;
  }
} //work ok

export async function searchDocsAggPip(req: any, res: any) {
  try {
    console.log("At searchDocsAggPip");

    const { collectionName, tableIndex, regexToSearch } = req.body;
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

    // Aggregation pipeline
    const pipeline = [
      { $match: { tableIndex } }, // Match the tableIndex
      { 
        $match: { 
          data: { 
            $regex: regexToSearch, 
            $options: "i" 
          } 
        } 
      }, // Regex search
      { 
        $match: { 
          data: { 
            $not: /^data:image\// 
          } 
        } 
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
    res.status(500).json({ message: error.message || "Internal server error" });
  }
} //work ok
