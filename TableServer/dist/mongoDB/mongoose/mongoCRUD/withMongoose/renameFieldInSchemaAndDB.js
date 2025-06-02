"use strict";
//! Do not use this function (it works) because it causes severe disruptions in the DB
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
exports.renameFieldInSchemaAndDB = renameFieldInSchemaAndDB;
function renameFieldInSchemaAndDB(modelName, oldFieldName, newFieldName, defaultValue) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the old field exists in the schema and the new one does not
            if (oldFieldName in modelName.schema.paths && !(newFieldName in modelName.schema.paths)) {
                // Step 1: Dynamically add the new field to the schema
                const newFieldSchema = {
                    [newFieldName]: { type: typeof defaultValue, default: defaultValue },
                };
                modelName.schema.add(newFieldSchema);
                // Step 2: Update documents by copying the data from oldFieldName to newFieldName
                const update = {
                    $set: { [newFieldName]: `$${oldFieldName}` },
                };
                // MongoDB aggregation to update using oldField value for each document
                const result = yield modelName.updateMany({}, update);
                console.log(`${result.modifiedCount} documents were updated with the new field "${String(newFieldName)}".`);
                // Step 3: Remove the old field from the schema and documents
                modelName.schema.remove(oldFieldName); // Remove from schema
                const unsetUpdate = { $unset: { [oldFieldName]: "" } };
                yield modelName.updateMany({}, unsetUpdate); // Remove from documents
                console.log(`Field "${String(oldFieldName)}" successfully renamed to "${String(newFieldName)}".`);
            }
            else {
                console.log(`Cannot rename: Either "${String(oldFieldName)}" does not exist or "${String(newFieldName)}" already exists in the schema.`);
            }
        }
        catch (err) {
            console.error(`Error renaming field from "${String(oldFieldName)}" to "${String(newFieldName)}":`, err);
        }
    });
}
//# sourceMappingURL=renameFieldInSchemaAndDB.js.map