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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDocsAggPip = searchDocsAggPip;
exports.deleteTablesDocuments = deleteTablesDocuments;
exports.exportTableAsCSV = exportTableAsCSV;
const mongoDBWrapper_1 = require("../../mongoDB/nativeDriver/mongoDBWrapper");
const mongodb_1 = require("mongodb");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
//!get search result
function searchDocsAggPip(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("At searchDocsAggPip");
            const { collectionName, tableId, regexToSearch } = req.query;
            console.log("At searchDocsAggPip collectionName, tableIndex, regexToSearch:", collectionName, tableId, regexToSearch);
            if (!collectionName || tableId === undefined || !regexToSearch) {
                throw new Error("Missing required fields: collectionName, tableIndex, or regexToSearch");
            }
            console.log("Inputs:", { collectionName, tableId, regexToSearch });
            //step 1: Aggregation pipeline for the cell search
            const pipeline = [
                { $match: { tableId, type: "cell" } },
                {
                    $match: {
                        data: {
                            $regex: regexToSearch,
                            $options: "i",
                        },
                    },
                }, // Regex search
                {
                    $match: {
                        data: {
                            $not: /^data:image\//,
                        },
                    },
                }, // Exclude images
            ];
            const firstResult = yield mongoDBWrapper_1.MongoDBWrapper.searchDocumentsAggPip(collectionName, pipeline);
            console.log("First result:", firstResult); //!till here works ok
            //step 2: Extract unique rowIndexes
            const rowIndexSet = new Set(firstResult
                .map((doc) => doc.rowIndex)
                .filter((rowIndex) => rowIndex !== undefined));
            console.log("Unique rowIndexes:", Array.from(rowIndexSet));
            // Step 3: Fetch documents for all unique rowIndexes in the same tableId
            const rowIndexArray = Array.from(rowIndexSet); // Convert Set to Array
            console.log("Row Index Array for Step 3:", rowIndexArray);
            const rowPipeline = [
                {
                    $match: {
                        tableId, // Match the same tableId
                        rowIndex: { $in: rowIndexArray }, // Match any rowIndex in the set
                    },
                },
                {
                    $match: {
                        type: "cell", // Optional: Ensure only 'cell' type documents
                    },
                },
            ];
            const finalResults = yield mongoDBWrapper_1.MongoDBWrapper.searchDocumentsAggPip(collectionName, rowPipeline);
            console.log("finalResults Step 3:", finalResults);
            res.status(200).json(finalResults);
        }
        catch (error) {
            console.error("Error in searchDocsAggPip:", error.message);
            res.status(500).json({
                message: error.message || "Internal server error in searchDocsAggPip",
            });
        }
    });
} //work ok
//!delete table - splits the req into two streams for deleting all table's related documents
function deleteTablesDocuments(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { query } = req.body;
            const { collectionName } = req.body;
            if (!query || !query._id || !collectionName)
                throw new Error("At deleteTablesDocuments no query or collectionName");
            console.log("At deleteTablesDocuments the query is:", query);
            console.log("At deleteTablesDocuments the collectionName is:", collectionName);
            //step 1: delete all table's cells/columns type document by tableId field
            const tableId = query._id;
            const newQuery = { tableId: tableId };
            const response1 = yield mongoDBWrapper_1.MongoDBWrapper.deleteDocuments(collectionName, newQuery);
            if (!response1.acknowledged) {
                throw new Error("Failed to delete associated cell documents.");
            }
            //step 2: delete the table type document by it's id
            // Convert _id to ObjectId if it exists in the query
            if (query._id && typeof query._id === "string") {
                query._id = new mongodb_1.ObjectId(query._id);
            }
            const response2 = yield mongoDBWrapper_1.MongoDBWrapper.deleteDocument(collectionName, query);
            if (!response2.acknowledged) {
                throw new Error("Failed to delete the table document.");
            }
            res.send(response2);
        }
        catch (error) {
            console.error("Error in deleteTablesDocuments:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
} //work ok
function exportTableAsCSV(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { tableId } = req.params;
            if (!tableId) {
                return res.status(400).json({ error: "tableId is required" });
            }
            // Fetch all documents for the given tableId
            const query = { tableId };
            const tableData = yield mongoDBWrapper_1.MongoDBWrapper.readDocuments("tables", query);
            if (!tableData || tableData.length === 0) {
                return res.status(404).json({ error: "No data found for this table" });
            }
            // Separate columns and cells
            const columns = tableData
                .filter((doc) => doc.type === "column" && doc.rowIndex === 0)
                .sort((a, b) => a.columnIndex - b.columnIndex); // Sort headers by columnIndex
            const cells = tableData
                .filter((doc) => doc.type === "cell")
                .sort((a, b) => a.rowIndex !== b.rowIndex
                ? a.rowIndex - b.rowIndex
                : a.columnIndex - b.columnIndex); // Sort first by rowIndex, then by columnIndex
            if (columns.length === 0) {
                return res.status(400).json({ error: "No column headers found" });
            }
            // Extract headers (column names)
            const headers = columns.map((col) => col.data);
            // Create a dictionary to group cells by rowIndex
            const rows = {};
            cells.forEach((cell) => {
                if (!rows[cell.rowIndex]) {
                    rows[cell.rowIndex] = new Array(columns.length).fill(""); // Empty row with correct length
                }
                // Skip if cell.data is null or undefined
                if (!cell.data) {
                    return; // Skip empty or null/undefined data
                }
                // Skip images (if data is Base64 or image URL)
                if (cell.data.startsWith("data:image/") || /\.(jpg|jpeg|png|gif|svg)$/i.test(cell.data)) {
                    return; // Skip the image data completely
                }
                // Convert links to Excel-friendly hyperlinks
                if (/^https?:\/\//.test(cell.data)) {
                    rows[cell.rowIndex][cell.columnIndex - 1] = `=HYPERLINK("${cell.data.substring(0, 255)}", "link")`;
                }
                else {
                    rows[cell.rowIndex][cell.columnIndex - 1] = cell.data; // Regular text
                }
            });
            // Convert data into CSV format
            const csvRows = [
                headers.join(","), // First row is column headers
                ...Object.keys(rows)
                    .map((rowIndex) => rows[parseInt(rowIndex, 10)]
                    .map((cell) => `"${cell.replace(/"/g, '""')}"`) // Escape quotes & preserve new lines
                    .join(",")) // Convert row to CSV format
            ];
            const csvContent = csvRows.join("\n");
            const filePath = path_1.default.join(__dirname, `table_${tableId}.csv`);
            fs_1.default.writeFileSync(filePath, "\uFEFF" + csvContent, "utf8");
            res.download(filePath, `table_${tableId}.csv`, () => {
                fs_1.default.unlinkSync(filePath); // Delete file after sending
            });
        }
        catch (error) {
            console.error("Export Error:", error);
            res.status(500).json({ error: "Failed to export table data" });
        }
    });
}
//# sourceMappingURL=specificTablesControllers.js.map