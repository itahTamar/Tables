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
  private static dbName: string = "testNativeDriverDatabase"; //! Replace when you want to create/connect to new/existing database
  private static client: MongoClient | null = null;
  private static db: Db | null = null;

  // Connect to MongoDB
  static async connect(): Promise<Db> {
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
  static async close(): Promise<void> {
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
  static async create(
    collectionName: string,
    document: object
  ): Promise<InsertOneResult | null> {
    this.ensureConnected();
    const collection: Collection = this.db.collection(collectionName);
    try {
      const result: InsertOneResult = await collection.insertOne(document);
      console.log("Document inserted:", result);
      return result;
    } catch (err) {
      console.error("Error inserting document:", err);
      return null;
    }
  }

  // READ: Find one document by a query
  static async read(collectionName: string, query: object): Promise<object | null> {
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
  }

  // READ: Find documents with optional filtering and sorting
  static async readDocuments(collectionName: string, query: object = {}, sort = {}) {
    this.ensureConnected();;
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
  static async update(
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
  }

  // UPDATE: Update multiple documents based on a filter
  static async updateDocuments(
    collectionName: string,
    filter: object,
    updateDoc: object
  ) {
    this.ensureConnected();
    const collection: Collection = this.db!.collection(collectionName);

    try {
      // Use updateMany to update all documents that match the filter
      // you can pass multiple fields inside a single $set object to update multiple fields in a single update operation
      const result = await collection.updateMany(filter, { $set: updateDoc });

      console.log(`Matched ${result.matchedCount} document(s)`);
      console.log(`Modified ${result.modifiedCount} document(s)`);

      return result;
    } catch (error) {
      console.error("Error updating documents:", error);
      throw error;
    }
  }

  // DELETE: Delete a document from a collection
  static async delete(collectionName: string, query: object): Promise<DeleteResult> {
    this.ensureConnected();
    const collection: Collection = this.db!.collection(collectionName);
    try {
      const result: DeleteResult = await collection.deleteOne(query);
      console.log(`Deleted ${result.deletedCount} document(s)`);
      return result;
    } catch (err) {
      console.error("Error deleting document:", err);
      throw err;
    }
  }

  // DELETE: Delete several documents from a collection
  static async deleteDocuments(
    collectionName: string,
    query: object
  ): Promise<DeleteResult> {
    this.ensureConnected();
    const collection: Collection = this.db!.collection(collectionName);
    try {
      const result: DeleteResult = await collection.deleteMany(query);
      console.log(`Deleted ${result.deletedCount} document(s)`);
      return result;
    } catch (err) {
      console.error("Error deleting documents:", err);
      throw err;
    }
  }
}

export { MongoDBWrapper };
