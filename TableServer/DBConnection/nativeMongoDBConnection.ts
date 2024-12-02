import { MongoClient, Db } from 'mongodb';

// MongoDB connection URL and Database Name
const url = 'mongodb://localhost:27017';  // Replace with your MongoDB URL
const dbName = 'testDatabase';            // Replace with your database name

let db: Db | null = null //establish a global db connection variable
const client = new MongoClient(url);

export async function connectToDatabase(): Promise<Db> {
  try {
    if (db) {
      // If already connected, return the existing connection
      return db;
    }
    await client.connect();
    db = client.db(dbName);  // Set the db instance to the connected client
    return db  // Return the database connection
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}