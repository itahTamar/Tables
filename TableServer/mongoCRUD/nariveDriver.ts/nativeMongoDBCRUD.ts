import { connectToDatabase } from "../../DBConnection/nativeMongoDBConnection";
import { Db } from "mongodb";

// CREATE: Insert a document into a collection
export async function createDocument(collectionName, document) {
  const db: Db = await connectToDatabase();
  const collection = db.collection(collectionName);

  try {
    const result = await collection.insertOne(document);
    console.log("Document inserted:", result.insertedId);
    return true;
  } catch (error) {
    console.error("Error inserting document:", error);
    return false;
  }
}

// READ: Find documents with optional filtering and sorting
export async function readDocuments(collectionName, query = {}, sort = {}) {
  const db: Db = await connectToDatabase();
  const collection = db.collection(collectionName);

  try {
    const documents = await collection.find(query).sort(sort).toArray();
    console.log("Found documents:", documents);
    return documents;
  } catch (error) {
    console.error("Error reading documents:", error);
  }
}

// UPDATE: Update a document based on a filter
export async function updateDocument(collectionName, filter, updateDoc) {
  const db: Db = await connectToDatabase();
  const collection = db.collection(collectionName);

  try {
    const result = await collection.updateOne(filter, { $set: updateDoc });
    console.log("Updated document count:", result.modifiedCount);
  } catch (error) {
    console.error("Error updating document:", error);
  }
}

// DELETE: Delete a document based on a filter
export async function deleteDocument(collectionName, filter) {
  const db: Db = await connectToDatabase();
  const collection = db.collection(collectionName);

  try {
    const result = await collection.deleteOne(filter);
    console.log("Deleted document count:", result.deletedCount);
  } catch (error) {
    console.error("Error deleting document:", error);
  }
}
