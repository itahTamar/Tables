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
exports.addDoc = addDoc;
exports.deleteDoc = deleteDoc;
exports.deleteDocs = deleteDocs;
exports.updateDoc = updateDoc;
exports.updateDocs = updateDocs;
exports.getDoc = getDoc;
exports.getDocs = getDocs;
exports.bulkUpdateDocs = bulkUpdateDocs;
const mongoDBWrapper_1 = require("../../mongoDB/nativeDriver/mongoDBWrapper");
const mongodb_1 = require("mongodb");
//!create doc
function addDoc(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { collectionName } = req.body;
            const { document } = req.body;
            if (!collectionName || !document)
                throw new Error("no collectionName or document");
            // Convert _id to ObjectId if it's present and is a string
            if (document._id && typeof document._id === "string") {
                document._id = new mongodb_1.ObjectId(document._id);
            }
            // Check if the middleware added `req.user`
            if (req.user) {
                console.log("User ID from middleware:", req.user);
                // Add the userId as an object to the `users` array
                if (!Array.isArray(document.users)) {
                    document.users = []; // Ensure `users` is an array if not already
                }
                document.users.push({ userId: req.user });
            }
            // Save the new doc to MongoDB
            const response = yield mongoDBWrapper_1.MongoDBWrapper.createDocument(collectionName, document);
            console.log("At addDoc the response:", response); //=>{acknowledged, insertedId}
            if (!response)
                throw new Error("at addDoc Fails to save new doc");
            res.send(response);
        }
        catch (error) {
            console.error("Error in addDoc:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
} //work ok
//!delete one doc
function deleteDoc(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { collectionName } = req.body;
            const { query } = req.body;
            if (!collectionName || !query)
                throw new Error("no collectionName or query");
            console.log("At deleteDoc the query is:", query);
            // Convert _id to ObjectId if it exists in the query
            if (query._id && typeof query._id === "string") {
                query._id = new mongodb_1.ObjectId(query._id);
            }
            // delete the doc from MongoDB
            const response = yield mongoDBWrapper_1.MongoDBWrapper.deleteDocument(collectionName, query);
            console.log("At deleteDoc the response:", response);
            if (!response)
                throw new Error("at deleteDoc Fails to save new doc");
            res.send(response);
        }
        catch (error) {
            console.error("Error in deleteDoc:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
} //work ok
//!delete many documents
function deleteDocs(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { collectionName } = req.body;
            const { query } = req.body;
            if (!collectionName || !query)
                throw new Error("no collectionName or query");
            console.log("At deleteDocs the query is:", query);
            // Convert _id to ObjectId if it exists in the query
            if (query._id && typeof query._id === "string") {
                query._id = new mongodb_1.ObjectId(query._id);
            }
            // delete the doc from MongoDB
            const response = yield mongoDBWrapper_1.MongoDBWrapper.deleteDocuments(collectionName, query);
            console.log("At deleteDocs the response:", response);
            if (!response)
                throw new Error("at deleteDocs Fails to save new doc");
            res.send(response);
        }
        catch (error) {
            console.error("Error in deleteDocs:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
} //work ok
//!update one doc
function updateDoc(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { collectionName } = req.body;
            const { query } = req.body;
            const { update } = req.body;
            console.log("At updateDoc the collectionName:", collectionName);
            console.log("At updateDoc the query:", query);
            console.log("At updateDoc the query._id:", query._id);
            console.log("At updateDoc the update:", update);
            if (!collectionName || !query || !update)
                throw new Error("no collectionName or query or update");
            // Convert _id to ObjectId if it exists in the query
            if (query._id && typeof query._id === "string") {
                query._id = new mongodb_1.ObjectId(query._id);
            }
            // update the doc to MongoDB
            const response = yield mongoDBWrapper_1.MongoDBWrapper.updateDocument(collectionName, query, update);
            console.log("At updateDoc the response:", response);
            return response;
        }
        catch (error) {
            console.error("Error in updateDoc:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
} //work ok //!not using that
function updateDocs(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { collectionName } = req.body;
            const { query } = req.body;
            const { update } = req.body;
            if (!collectionName || !query || !update)
                throw new Error("no collectionName or query or update");
            console.log("At updateDocs the collectionName:", collectionName);
            console.log("At updateDocs the query:", query);
            console.log("At updateDocs the query._id:", query._id);
            console.log("At updateDocs the update:", update);
            // Convert _id to ObjectId if it exists in the query
            if (query._id && typeof query._id === "string") {
                query._id = new mongodb_1.ObjectId(query._id);
            }
            // update the documents to MongoDB
            const response = yield mongoDBWrapper_1.MongoDBWrapper.updateDocuments(collectionName, query, update);
            console.log("At updateDocs the response:", response);
            if (response.matchedCount === 0)
                throw new Error("at updateDocs Fails to find the docs. result.matchedCount=0");
            res.send(true);
        }
        catch (error) {
            console.error("Error in updateDocs:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
} //work ok
//!get one doc - not in use
function getDoc(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
                parsedQuery._id = new mongodb_1.ObjectId(parsedQuery._id);
            }
            // read the doc from MongoDB
            const response = yield mongoDBWrapper_1.MongoDBWrapper.readDocument(collectionName, parsedQuery);
            console.log("At getDoc the response:", response);
            if (!response)
                throw new Error("at getDoc Fails to save new doc");
            res.send(response);
        }
        catch (error) {
            console.error("Error in getDoc:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
} //work ok
//!get one/all doc
function getDocs(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            if (req.user) {
                console.log("User ID from middleware:", req.user);
                // Add the userId in the correct nested structure
                if (!parsedQuery["users.userId"]) {
                    parsedQuery["users.userId"] = req.user; // Adds userId to query
                }
            }
            // Convert _id to ObjectId if it exists in the query
            if (parsedQuery._id && typeof parsedQuery._id === "string") {
                parsedQuery._id = new mongodb_1.ObjectId(parsedQuery._id);
            }
            // read the doc from MongoDB
            const response = yield mongoDBWrapper_1.MongoDBWrapper.readDocuments(collectionName, parsedQuery);
            console.log("At getDoc the response:", response);
            if (!response)
                throw new Error("at getDoc Fails to save new doc");
            res.send(response);
        }
        catch (error) {
            console.error("Error in getDoc:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
} //work ok
//!update several documents with different updates-values
function bulkUpdateDocs(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { collectionName, updates } = req.body;
            if (!collectionName || !updates)
                throw new Error("Missing collectionName or updates");
            // Ensure _id is ObjectId
            updates.forEach((item) => {
                if (item._id && typeof item._id === "string") {
                    item._id = new mongodb_1.ObjectId(item._id);
                }
            });
            const result = yield mongoDBWrapper_1.MongoDBWrapper.bulkUpdateDocuments(collectionName, updates);
            res.send({ modifiedCount: result.modifiedCount });
        }
        catch (error) {
            console.error("Error in bulkUpdateDocs:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
//# sourceMappingURL=docsControllers.js.map