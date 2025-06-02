"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const docsControllers_1 = require("./docsControllers");
const helpFunctions_1 = require("../helpFunctions");
const specificTablesControllers_1 = require("./specificTablesControllers");
const router = express_1.default.Router();
router
    .post("/addDoc", docsControllers_1.addDoc) //work
    .post("/addNewUsersTable", helpFunctions_1.extractCookie, docsControllers_1.addDoc) //work
    .get("/getDoc", docsControllers_1.getDocs) //work
    .get("/getUserDocs", helpFunctions_1.extractCookie, docsControllers_1.getDocs) //work
    .get("/searchDocsAggPip", helpFunctions_1.extractCookie, specificTablesControllers_1.searchDocsAggPip) //work
    .get("/export/csv/:tableId", specificTablesControllers_1.exportTableAsCSV)
    .patch("/updateDocs", docsControllers_1.updateDocs) //
    .delete("/deleteDoc", docsControllers_1.deleteDoc) //work
    .delete("/deleteTablesDocs", specificTablesControllers_1.deleteTablesDocuments) //work
    .patch("/bulkUpdateDocs", docsControllers_1.bulkUpdateDocs);
exports.default = router;
//# sourceMappingURL=docRouter.js.map