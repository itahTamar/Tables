"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allDataObject = exports.DataObjectModel = exports.DataObjectSchema = exports.DataObject = void 0;
const mongoose_1 = require("mongoose");
class DataObject {
    constructor(init) {
        Object.assign(this, init);
    }
}
exports.DataObject = DataObject;
exports.DataObjectSchema = new mongoose_1.Schema({ strict: false } //allow any field in the schema
);
// Pre-save hook to auto-increment index - create new mongo-index for the DataObject index field
// DataObjectSchema.pre<IDataObjectDocument>("save", async function (next) {
//   if (this.isNew) {
//     const lastDataObject = await DataObjectModel.findOne().sort({ index: -1 });
//     this.index = lastDataObject ? lastDataObject.index + 1 : 1;
//   }
//   next();
// });
exports.DataObjectModel = (0, mongoose_1.model)("DataObjects", exports.DataObjectSchema); //the collection name is in plural!!!
exports.allDataObject = [];
//# sourceMappingURL=dataObjectModel.js.map