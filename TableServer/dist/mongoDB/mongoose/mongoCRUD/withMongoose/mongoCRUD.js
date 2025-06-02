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
exports.getOneJoinDataFromMongoDB = exports.addJoinDataToMongoDB = exports.deleteManyDataFromMongoDB = exports.deleteOneDataFromMongoDB = exports.updateDataOnMongoDB = exports.getOneDataFromMongoDB = exports.getAllDataFromMongoDB = exports.addDataToMongoDB = void 0;
exports.addFieldToSchemaAndMongoDB = addFieldToSchemaAndMongoDB;
exports.deleteFieldFromSchemaAndMongoDB = deleteFieldFromSchemaAndMongoDB;
const mongodb_1 = require("mongodb");
//!create:
//add object/document to a specific collection
const addDataToMongoDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("at mongoCRUD/saveData the data is:", data);
        const response = yield data.save();
        console.log("at mongoCRUD/saveData the response is:", response);
        if (response) {
            return { ok: true, response };
        }
    }
    catch (error) {
        console.error(error);
        return { ok: false, error: error.message };
    }
}); //work ok
exports.addDataToMongoDB = addDataToMongoDB;
//add new field to an object/document
function addFieldToSchemaAndMongoDB(modelName, fieldName, defaultValue) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the field already exists in the schema
            if (!(fieldName in modelName.schema.paths)) {
                // Dynamically add the field to the schema
                const newFieldSchema = {
                    [fieldName]: {
                        type: typeof defaultValue,
                        default: defaultValue,
                    },
                };
                // Dynamically add the field to the model's schema
                modelName.schema.add(newFieldSchema);
            }
            // Update all documents with the new field and default value
            const update = {
                $set: { [fieldName]: defaultValue },
            };
            const result = yield modelName.updateMany({}, update);
            console.log(`${result.modifiedCount} documents were updated with the field "${String(fieldName)}".`);
        }
        catch (err) {
            console.error(`Error updating documents with the field "${String(fieldName)}":`, err);
        }
    });
}
//!read:
//read - get all - find all
const getAllDataFromMongoDB = (modelName, filterCriteria) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("at mongoCRUD/getAllDataFromMongoDB the modelName is:", modelName);
        const response = yield modelName.find(filterCriteria);
        console.log("at mongoCRUD/getAllDataFromMongoDB the response is:", response);
        if (response) {
            return { ok: true, response };
        }
        else {
            return { ok: false };
        }
    }
    catch (error) {
        console.error(error);
        return { ok: false, error: error.message };
    }
}); //work ok
exports.getAllDataFromMongoDB = getAllDataFromMongoDB;
//read - get one - find one
const getOneDataFromMongoDB = (modelName, filterCriteria) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("at mongoCRUD/getOneDataFromMongoDB the modelName is:", modelName);
        console.log("at mongoCRUD/getOneDataFromMongoDB the filterCriteria is:", filterCriteria);
        const response = yield modelName.findOne(filterCriteria).maxTimeMS(10000);
        console.log("at mongoCRUD/getOneDataFromMongoDB the response is:", response);
        if (response) {
            return { ok: true, response };
        }
        if (!response) {
            return { ok: false };
        }
        if (response === null) {
            return { ok: false }; //the document not found in DB
        }
    }
    catch (error) {
        console.error(error);
        return { ok: false, error: error.message };
    }
}); //work ok
exports.getOneDataFromMongoDB = getOneDataFromMongoDB;
//!update:
//find one document and update - can pass multiple fields for updating.
const updateDataOnMongoDB = (modelName, // Generic model passed to the function
filter, // Filter criterion (e.g., email, ID, etc.) - how to find the document
update // Fields to update - work on multiple fields
) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("at mongoCRUD/findOneAndUpdateDataOnMongoDB");
        console.log("at mongoCRUD/findOneAndUpdateDataOnMongoDB the modelName", modelName);
        console.log("at mongoCRUD/findOneAndUpdateDataOnMongoDB the filter", filter);
        console.log("at mongoCRUD/findOneAndUpdateDataOnMongoDB the update", update);
        // Find a document by the filter and update the specified fields
        const response = yield modelName.findOneAndUpdate(filter, { $set: update }, {
            //$set Operator: This ensures that the fields passed in the update object are updated in the document.
            new: true, // Return the updated document
        });
        if (response) {
            console.log("at mongoCRUD/findOneAndUpdateDataOnMongoDB the response", response);
            return { ok: true, response, message: "Document updated successfully" };
        }
        else {
            return { ok: false, message: "Document not found or update failed" };
        }
    }
    catch (error) {
        console.error("at mongoCRUD/findOneAndUpdateDataOnMongoDB error", error);
        return { ok: false, error: error.message };
    }
}); //work ok
exports.updateDataOnMongoDB = updateDataOnMongoDB;
//!delete:
//item is uniq (delete one)
const deleteOneDataFromMongoDB = (modelName, item) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("At mongoCRUD/deleteOneDataFromMongoDB the modelName:", modelName);
        console.log("At mongoCRUD/deleteOneDataFromMongoDB the item:", item);
        const response = yield modelName.findOneAndDelete(item);
        console.log("At mongoCRUD/deleteOneDataFromMongoDB the response:", response);
        if (response === null)
            throw new Error("response is null");
        if (response) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.error(error);
        return { ok: false, error: error.message };
    }
}); //work ok
exports.deleteOneDataFromMongoDB = deleteOneDataFromMongoDB;
//delete many by one field
const deleteManyDataFromMongoDB = (modelName, filter) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("At deleteManyDataFromMongoDB the modelName:", modelName);
        console.log("At deleteManyDataFromMongoDB the filter:", filter);
        const result = yield modelName.deleteMany({ fieldOfInterest: `${filter}` });
        console.log("At deleteManyDataFromMongoDB result:", result);
        if (result.deletedCount === 0) {
            return {
                ok: false,
                deletedCount: 0,
                error: "No documents matched the filter",
            };
        }
        return { ok: true, deletedCount: result.deletedCount };
    }
    catch (error) {
        console.error("Error in deleteManyDataFromMongoDB:", error);
        return { ok: false, error: error.message };
    }
}); //work ok
exports.deleteManyDataFromMongoDB = deleteManyDataFromMongoDB;
//delete object/document from a specific collection
function deleteFieldFromSchemaAndMongoDB(modelName, FieldName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!FieldName)
                throw new Error("must receive the field name for delete");
            console.log("at deleteFieldFromSchemaAndMongoDB the FieldName:", FieldName);
            if (FieldName in modelName.schema.paths) {
                //Remove the field from the schema and documents
                modelName.schema.remove(FieldName); // Remove from schema
                const unsetUpdate = {
                    $unset: { [FieldName]: "" },
                };
                yield modelName.updateMany({}, unsetUpdate); // Remove from documents
                console.log(`Field "${String(FieldName)}" successfully deleted from all documents.`);
                return true;
            }
            else {
                console.log(`"${String(FieldName)}" field do not exist`);
                return false;
            }
        }
        catch (err) {
            console.error(`Error deleting field from "${String(FieldName)}":`, err);
        }
    });
} //!not working good - don't know where the error
//**for join collection:
//!create:
const addJoinDataToMongoDB = (modelName, field1Name, // field's name of first object (example: userId)
field2Name, // field's name of second object (example: tableId)
item1ID, // the id of the first object
item2ID // the id of the second object
) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("at mongoCRUD/createAndSaveData the field1Name is:", field1Name);
        console.log("at mongoCRUD/createAndSaveData the field2Name is:", field2Name);
        console.log("at mongoCRUD/createAndSaveData the item1ID is:", item1ID);
        console.log("at mongoCRUD/createAndSaveData the item2ID is:", item2ID);
        console.log("at mongoCRUD/createAndSaveData the modelName is:", modelName);
        if (!item1ID || !item2ID) {
            throw new Error("Invalid item1ID or item2ID");
        }
        const newJoinData = yield modelName.create({
            [field1Name]: item1ID,
            [field2Name]: item2ID,
        }); // save the new join in the join-DB
        console.log("at mongoCRUD/createAndSaveData the newJoinData is:", newJoinData);
        const response = yield (0, exports.addDataToMongoDB)(newJoinData);
        console.log("at mongoCRUD/createAndSaveData the response is:", response);
        if (response) {
            return { ok: true, response };
        }
    }
    catch (error) {
        console.error(error);
        return { ok: false, error: error.message };
    }
}); //work ok
exports.addJoinDataToMongoDB = addJoinDataToMongoDB;
//!get:
//read - get by id
const getOneJoinDataFromMongoDB = (modelName, filterCriteria) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the modelName:", modelName);
        console.log("at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the filterCriteria:", filterCriteria);
        // Check if id is a string and convert it to ObjectId
        if (typeof filterCriteria.id === "string") {
            filterCriteria.id = new mongodb_1.ObjectId(filterCriteria.id);
            console.log("at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the new filterCriteria:", filterCriteria);
        }
        const response = yield modelName.findOne(filterCriteria);
        console.log("at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the response is:", response);
        if (response) {
            return { ok: true, response };
        }
        else {
            return { ok: false, error: "No document found" };
        }
    }
    catch (error) {
        console.error(error);
        return { ok: false, error: error.message };
    }
}); //work ok
exports.getOneJoinDataFromMongoDB = getOneJoinDataFromMongoDB;
//# sourceMappingURL=mongoCRUD.js.map