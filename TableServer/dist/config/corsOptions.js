"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const allowedOrigins_1 = require("./allowedOrigins");
exports.corsOptions = {
    origin: (origin, callback) => {
        console.log("allowed origin are:", allowedOrigins_1.allowedOrigins);
        if (allowedOrigins_1.allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
//# sourceMappingURL=corsOptions.js.map