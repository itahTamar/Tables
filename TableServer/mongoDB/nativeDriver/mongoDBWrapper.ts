import {
  MongoClient,
  Db,
  Collection,
  InsertOneResult,
  UpdateResult,
  DeleteResult,
} from "mongodb";

class MongoDBWrapper {
  private static uri: string = process.env.MONGO_URL;
  private static dbName: string = "tableProjectV2"; //! Replace when you want to create/connect to new/existing database
  private static client: MongoClient | null = null;
  private static db: Db | null = null;

  // Connect to MongoDB
  static async connectMongoDB(): Promise<Db> {
    if (!this.client) {
      this.client = new MongoClient(this.uri);
    }
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log("Connected to MongoDB from wrapper");
      return this.db; // Return the database connection
    } catch (err) {
      console.error("Error connecting to MongoDB:", err);
      throw err;
    }
  }

  // Close the connection
  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log("Connection closed");
    }
  }

  // Ensure the database is connected
  private static ensureConnected(): void {
    if (!this.db) {
      throw new Error("Database not connected");
    }
  }

  // CREATE: Insert a document into a collection
  static async createDocument(
    collectionName: string,
    document: object
  ): Promise<InsertOneResult | null> {
    this.ensureConnected();
    const collection: Collection = this.db!.collection(collectionName);
    try {
      const result: InsertOneResult = await collection.insertOne(document);
      console.log("Document inserted:", result); //=>{acknowledged, insertedId}
      return result;
    } catch (err) {
      console.error("Error inserting document:", err);
      return null;
    }
  } //work ok

  // READ: Find one document by a query
  static async readDocument(
    collectionName: string,
    query: object
  ): Promise<object | null> {
    this.ensureConnected();
    const collection: Collection = this.db!.collection(collectionName);
    try {
      const result: object | null = await collection.findOne(query);
      console.log("Document found:", result);
      return result;
    } catch (err) {
      console.error("Error finding document:", err);
      return null;
    }
  } //work ok

  // READ: Find documents with optional filtering and sorting
  static async readDocuments(
    collectionName: string,
    query: object = {},
    sort = {}
  ) {
    this.ensureConnected();
    console.log("At mongoDBWrapper.readDocuments the query:", query);

    const collection: Collection = this.db!.collection(collectionName);

    try {
      const documents = await collection.find(query).sort(sort).toArray();
      console.log("Found documents:", documents);
      return documents;
    } catch (error) {
      console.error("Error reading documents:", error);
      throw error;
    }
  }

  // UPDATE: Update a document in a collection
  static async updateDocument(
    collectionName: string,
    query: object,
    update: object
  ): Promise<UpdateResult> {
    this.ensureConnected();
    const collection: Collection = this.db!.collection(collectionName);
    try {
      const result: UpdateResult = await collection.updateOne(query, {
        $set: update,
      });
      console.log(
        `Matched ${result.matchedCount} document(s) and modified ${result.modifiedCount} document(s)`
      );
      return result;
    } catch (err) {
      console.error("Error updating document:", err);
      throw err;
    }
  } //work ok - //!not returning the updated document - not using it

  // UPDATE: Update multiple documents based on a filter
  static async updateDocuments(
    collectionName: string,
    filter: object,
    updateDoc: object
  ) {
    this.ensureConnected();

    console.log("At MongoDBwrapper.updateDocuments the collectionName:", collectionName)
    console.log("At MongoDBwrapper.updateDocuments the filter:", filter)
    console.log("At MongoDBwrapper.updateDocuments the updateDoc:", updateDoc)

    const collection: Collection = this.db!.collection(collectionName);

    try {
      // Use updateMany to update all documents that match the filter
      // you can pass multiple fields inside a single $set object to update multiple fields in a single update operation
      const result = await collection.updateMany(filter, { $set: updateDoc });

      console.log(`Matched ${result.matchedCount} document(s) For filter:`, filter);
      console.log(`Modified ${result.modifiedCount} document(s) For filter:`, filter);

      // if (result.matchedCount===0) return false  //no document found!
      // else return result.modifiedCount;

      return result

    } catch (error) {
      console.error("Error updating documents:", error);
      throw error;
    }
  }

  // DELETE: Delete one document from a collection
  static async deleteDocument(
    collectionName: string,
    query: object
  ): Promise<DeleteResult> {
    this.ensureConnected();
    const collection: Collection = this.db!.collection(collectionName);
    console.log("At MongoDBWrapper/delete the query is:", query);

    try {
      const result: DeleteResult = await collection.deleteOne(query);
      console.log(`Deleted ${result.deletedCount} document(s)`);
      return result;
    } catch (err) {
      console.error("Error deleting document:", err);
      throw err;
    }
  } //work ok

  // DELETE: Delete several documents from a collection
  static async deleteDocuments(
    collectionName: string,
    query: object
  ): Promise<DeleteResult> {
    this.ensureConnected();
    console.log("collectionName sent to MongoDB:", collectionName);
    const collection: Collection = this.db!.collection(collectionName);
    try {
      console.log("Query sent to MongoDB:", query);
      const result: DeleteResult = await collection.deleteMany(query);
      console.log(`Deleted ${result.deletedCount} document(s)`);
      return result;
    } catch (err) {
      console.error("Error deleting documents:", err);
      throw err;
    }
  } //work ok

  // ADD FIELD: Add a new field to all documents in a collection with a default value
  static async addFieldToCollectionAndMongoDB(
    collectionName: string,
    fieldName: string,
    defaultValue: any
  ): Promise<void> {
    this.ensureConnected();
    const collection: Collection = this.db!.collection(collectionName);

    try {
      // Check if the field already exists in any document
      const sampleDoc = await collection.findOne({});
      if (sampleDoc && !(fieldName in sampleDoc)) {
        // Add the new field to all documents with the default value
        const update = {
          $set: { [fieldName]: defaultValue },
        };

        const result = await collection.updateMany({}, update);
        console.log(
          `${result.modifiedCount} documents were updated with the field "${fieldName}".`
        );
      } else {
        console.log(
          `Field "${fieldName}" already exists or no documents found.`
        );
      }
    } catch (err) {
      console.error(
        `Error adding field "${fieldName}" to documents in collection "${collectionName}":`,
        err
      );
    }
  }

  // DELETE FIELD: Remove a field from all documents in a collection
  static async deleteFieldFromCollectionAndMongoDB(
    collectionName: string,
    fieldName: string
  ): Promise<void> {
    this.ensureConnected();
    const collection: Collection = this.db!.collection(collectionName);

    try {
      // Check if the field exists in the documents
      const sampleDoc = await collection.findOne({});
      if (sampleDoc && fieldName in sampleDoc) {
        // Remove the field from all documents
        const update = {
          $unset: { [fieldName]: "" },
        };

        const result = await collection.updateMany({}, update);
        console.log(
          `${result.modifiedCount} documents had the field "${fieldName}" removed.`
        );
      } else {
        console.log(`Field "${fieldName}" does not exist in any documents.`);
      }
    } catch (err) {
      console.error(
        `Error removing field "${fieldName}" from documents in collection "${collectionName}":`,
        err
      );
    }
  }

  //search with Aggregation pipeline
  static async searchDocumentsAggPip(
    collectionName: string,
    pipeline: Array<Record<string, any>>,
    sort = {}
  ) {
    this.ensureConnected();
    const collection: Collection = this.db!.collection(collectionName);

    try {
      // Conditionally add $sort stage if sort object is not empty
      if (Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort });
      }
      const documents = await collection.aggregate(pipeline).toArray();
      console.log("Found documents:", documents);
      return documents;
    } catch (error) {
      console.error("Error reading documents:", error);
      throw error;
    }
  } //work ok

  // NEW METHOD: Bulk update multiple documents with individual updates
static async bulkUpdateDocuments(
  collectionName: string,
  updates: { _id: string; update: object }[]
) {
  this.ensureConnected();

  const collection: Collection = this.db!.collection(collectionName);

  const operations = updates.map(item => ({
    updateOne: {
      filter: { _id: new Object(item._id) },
      update: { $set: item.update },
    },
  }));

  try {
    const result = await collection.bulkWrite(operations);
    console.log(`Bulk updated ${result.modifiedCount} document(s).`);
    return result;
  } catch (error) {
    console.error("Error in bulkUpdateDocuments:", error);
    throw error;
  }
}

}

export { MongoDBWrapper };
