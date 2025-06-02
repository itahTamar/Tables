"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBWrapper = void 0;
const mongodb_1 = require("mongodb");
class MongoDBWrapper {
    // Connect to MongoDB
    static connectMongoDB() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                this.client = new mongodb_1.MongoClient(this.uri);
            }
            try {
                yield this.client.connect();
                this.db = this.client.db(this.dbName);
                console.log("Connected to MongoDB from wrapper");
                return this.db; // Return the database connection
            }
            catch (err) {
                console.error("Error connecting to MongoDB:", err);
                throw err;
            }
        });
    }
    // Close the connection
    static disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                yield this.client.close();
                console.log("Connection closed");
            }
        });
    }
    // Ensure the database is connected
    static ensureConnected() {
        if (!this.db) {
            throw new Error("Database not connected");
        }
    }
    // CREATE: Insert a document into a collection
    static createDocument(collectionName, document) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            const collection = this.db.collection(collectionName);
            try {
                const result = yield collection.insertOne(document);
                console.log("Document inserted:", result); //=>{acknowledged, insertedId}
                return result;
            }
            catch (err) {
                console.error("Error inserting document:", err);
                return null;
            }
        });
    } //work ok
    // READ: Find one document by a query
    static readDocument(collectionName, query) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            const collection = this.db.collection(collectionName);
            try {
                const result = yield collection.findOne(query);
                console.log("Document found:", result);
                return result;
            }
            catch (err) {
                console.error("Error finding document:", err);
                return null;
            }
        });
    } //work ok
    // READ: Find documents with optional filtering and sorting
    static readDocuments(collectionName_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, query = {}, sort = {}) {
            this.ensureConnected();
            console.log("At mongoDBWrapper.readDocuments the query:", query);
            const collection = this.db.collection(collectionName);
            try {
                const documents = yield collection.find(query).sort(sort).toArray();
                console.log("Found documents:", documents);
                return documents;
            }
            catch (error) {
                console.error("Error reading documents:", error);
                throw error;
            }
        });
    }
    // UPDATE: Update a document in a collection
    static updateDocument(collectionName, query, update) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            const collection = this.db.collection(collectionName);
            try {
                const result = yield collection.updateOne(query, {
                    $set: update,
                });
                console.log(`Matched ${result.matchedCount} document(s) and modified ${result.modifiedCount} document(s)`);
                return result;
            }
            catch (err) {
                console.error("Error updating document:", err);
                throw err;
            }
        });
    } //work ok - //!not returning the updated document - not using it
    // UPDATE: Update multiple documents based on a filter
    static updateDocuments(collectionName, filter, updateDoc) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            console.log("At MongoDBwrapper.updateDocuments the collectionName:", collectionName);
            console.log("At MongoDBwrapper.updateDocuments the filter:", filter);
            console.log("At MongoDBwrapper.updateDocuments the updateDoc:", updateDoc);
            const collection = this.db.collection(collectionName);
            try {
                // Use updateMany to update all documents that match the filter
                // you can pass multiple fields inside a single $set object to update multiple fields in a single update operation
                const result = yield collection.updateMany(filter, { $set: updateDoc });
                console.log(`Matched ${result.matchedCount} document(s) For filter:`, filter);
                console.log(`Modified ${result.modifiedCount} document(s) For filter:`, filter);
                // if (result.matchedCount===0) return false  //no document found!
                // else return result.modifiedCount;
                return result;
            }
            catch (error) {
                console.error("Error updating documents:", error);
                throw error;
            }
        });
    }
    // DELETE: Delete one document from a collection
    static deleteDocument(collectionName, query) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            const collection = this.db.collection(collectionName);
            console.log("At MongoDBWrapper/delete the query is:", query);
            try {
                const result = yield collection.deleteOne(query);
                console.log(`Deleted ${result.deletedCount} document(s)`);
                return result;
            }
            catch (err) {
                console.error("Error deleting document:", err);
                throw err;
            }
        });
    } //work ok
    // DELETE: Delete several documents from a collection
    static deleteDocuments(collectionName, query) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            console.log("collectionName sent to MongoDB:", collectionName);
            const collection = this.db.collection(collectionName);
            try {
                console.log("Query sent to MongoDB:", query);
                const result = yield collection.deleteMany(query);
                console.log(`Deleted ${result.deletedCount} document(s)`);
                return result;
            }
            catch (err) {
                console.error("Error deleting documents:", err);
                throw err;
            }
        });
    } //work ok
    // ADD FIELD: Add a new field to all documents in a collection with a default value
    static addFieldToCollectionAndMongoDB(collectionName, fieldName, defaultValue) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            const collection = this.db.collection(collectionName);
            try {
                // Check if the field already exists in any document
                const sampleDoc = yield collection.findOne({});
                if (sampleDoc && !(fieldName in sampleDoc)) {
                    // Add the new field to all documents with the default value
                    const update = {
                        $set: { [fieldName]: defaultValue },
                    };
                    const result = yield collection.updateMany({}, update);
                    console.log(`${result.modifiedCount} documents were updated with the field "${fieldName}".`);
                }
                else {
                    console.log(`Field "${fieldName}" already exists or no documents found.`);
                }
            }
            catch (err) {
                console.error(`Error adding field "${fieldName}" to documents in collection "${collectionName}":`, err);
            }
        });
    }
    // DELETE FIELD: Remove a field from all documents in a collection
    static deleteFieldFromCollectionAndMongoDB(collectionName, fieldName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            const collection = this.db.collection(collectionName);
            try {
                // Check if the field exists in the documents
                const sampleDoc = yield collection.findOne({});
                if (sampleDoc && fieldName in sampleDoc) {
                    // Remove the field from all documents
                    const update = {
                        $unset: { [fieldName]: "" },
                    };
                    const result = yield collection.updateMany({}, update);
                    console.log(`${result.modifiedCount} documents had the field "${fieldName}" removed.`);
                }
                else {
                    console.log(`Field "${fieldName}" does not exist in any documents.`);
                }
            }
            catch (err) {
                console.error(`Error removing field "${fieldName}" from documents in collection "${collectionName}":`, err);
            }
        });
    }
    //search with Aggregation pipeline
    static searchDocumentsAggPip(collectionName_1, pipeline_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, pipeline, sort = {}) {
            this.ensureConnected();
            const collection = this.db.collection(collectionName);
            try {
                // Conditionally add $sort stage if sort object is not empty
                if (Object.keys(sort).length > 0) {
                    pipeline.push({ $sort: sort });
                }
                const documents = yield collection.aggregate(pipeline).toArray();
                console.log("Found documents:", documents);
                return documents;
            }
            catch (error) {
                console.error("Error reading documents:", error);
                throw error;
            }
        });
    } //work ok
    // NEW METHOD: Bulk update multiple documents with individual updates
    static bulkUpdateDocuments(collectionName, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            const collection = this.db.collection(collectionName);
            const operations = updates.map(item => ({
                updateOne: {
                    filter: { _id: new Object(item._id) },
                    update: { $set: item.update },
                },
            }));
            try {
                const result = yield collection.bulkWrite(operations);
                console.log(`Bulk updated ${result.modifiedCount} document(s).`);
                return result;
            }
            catch (error) {
                console.error("Error in bulkUpdateDocuments:", error);
                throw error;
            }
        });
    }
}
exports.MongoDBWrapper = MongoDBWrapper;
MongoDBWrapper.uri = process.env.MONGO_URL;
MongoDBWrapper.dbName = "tableProjectV2"; //! Replace when you want to create/connect to new/existing database
MongoDBWrapper.client = null;
MongoDBWrapper.db = null;
//# sourceMappingURL=mongoDBWrapper.js.map