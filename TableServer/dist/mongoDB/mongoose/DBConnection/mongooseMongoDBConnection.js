"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_uri = process.env.MONGO_URL_MONGOOSE;
const connectionMongoWithMongoose = mongoose_1.default
    .connect(mongodb_uri)
    .then(() => {
    console.info("MongoDB connected with mongoose");
    // addFieldToSchemaAndMongoDB("field's name", "value");  //update a collection DB with a new field
})
    .catch((err) => {
    console.error(err);
});
exports.default = connectionMongoWithMongoose;
//# sourceMappingURL=mongooseMongoDBConnection.js.map