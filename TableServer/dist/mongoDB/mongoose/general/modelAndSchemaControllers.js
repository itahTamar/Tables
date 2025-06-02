"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.removeModelAndDropCollection = exports.clearCollection = exports.deleteModel = exports.dropCollection = exports.createNewSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const createNewSchema = (schemaName, fields) => {
    const schemaDefinition = {};
    fields.forEach((field) => {
        const { name, type, required, default: defaultValue } = field;
        // Dynamically assign the field type and other properties
        schemaDefinition[name] = {
            type: mongoose_1.default.Schema.Types[type],
            required: required || false,
        };
        if (defaultValue !== undefined) {
            schemaDefinition[name].default = defaultValue;
        }
    });
    // Create a new schema
    const newSchema = new mongoose_1.Schema(schemaDefinition);
    // Register the schema with Mongoose
    return mongoose_1.default.model(schemaName, newSchema);
};
exports.createNewSchema = createNewSchema;
//! Example usage
// const userSchemaFields: SchemaField[] = [
//     { name: 'username', type: 'String', required: true },
//     { name: 'email', type: 'String', required: true },
//     { name: 'age', type: 'Number' },
//     { name: 'isActive', type: 'Boolean', default: true },
// ];
// const UserModel = createNewSchema('User', userSchemaFields);
const dropCollection = (collectionName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = mongoose_1.default.connection;
        if (connection.collections[collectionName]) {
            yield connection.collections[collectionName].drop(); //Drops the collection from MongoDB
            console.log(`Collection ${collectionName} dropped successfully.`);
        }
        else {
            console.log(`Collection ${collectionName} does not exist.`);
        }
    }
    catch (error) {
        console.error(`Failed to drop collection: ${error.message}`);
    }
});
exports.dropCollection = dropCollection;
const deleteModel = (modelName) => {
    if (mongoose_1.default.models[modelName]) {
        delete mongoose_1.default.models[modelName]; //Deregisters the model from Mongoose
        console.log(`Model ${modelName} deleted from Mongoose.`);
    }
    else {
        console.log(`Model ${modelName} does not exist.`);
    }
};
exports.deleteModel = deleteModel;
const clearCollection = (modelName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const model = mongoose_1.default.models[modelName];
        if (model) {
            yield model.deleteMany({});
            console.log(`All documents in ${modelName} collection have been deleted.`);
        }
        else {
            console.log(`Model ${modelName} does not exist.`);
        }
    }
    catch (error) {
        console.error(`Failed to clear collection: ${error.message}`);
    }
});
exports.clearCollection = clearCollection;
const removeModelAndDropCollection = (modelName, collectionName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Remove the model from Mongoose
        (0, exports.deleteModel)(modelName);
        // Drop the collection
        (0, exports.dropCollection)(collectionName);
    }
    catch (error) {
        console.error(`Failed to remove model and drop collection: ${error.message}`);
    }
});
exports.removeModelAndDropCollection = removeModelAndDropCollection;
//# sourceMappingURL=modelAndSchemaControllers.js.map