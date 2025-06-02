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
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import {addFieldToUsers} from './API/users/updateUserDB'
//npm i dotenv
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const corsOptions_1 = require("./config/corsOptions");
const mailService_1 = require("./services/mailService"); // Import the sendEmail function
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.set("trust proxy", 1); //ensures cookies are received when the app is deployed on Render.com or another proxy
//middlewares
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true })); //parses incoming URL-encoded data (like form submissions) and add it to req.body. it limit the size of the request body.
app.use((0, cors_1.default)(corsOptions_1.corsOptions));
//middleware for using parser
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
    console.log("SERVER Incoming Cookies:", req.cookies);
    next();
});
app.get("/api/test-cookies", (req, res) => {
    console.log("SERVER Incoming Cookies:", req.cookies);
    res.json({ receivedCookies: req.cookies });
});
//connection to db
const mongooseMongoDBConnection_1 = __importDefault(require("./mongoDB/mongoose/DBConnection/mongooseMongoDBConnection"));
// import { connectToDatabase } from "./mongoDB/nativeDriver/nativeMongoDBConnection";
const mongoDBWrapper_1 = require("./mongoDB/nativeDriver/mongoDBWrapper");
//API routes
const userRoutes_1 = __importDefault(require("./API/User/userRoutes"));
app.use("/api/users", userRoutes_1.default);
const docRouter_1 = __importDefault(require("./API/Docs/docRouter"));
app.use("/api/doc", docRouter_1.default);
// Route for sending recovery email
const helpFunctions_1 = require("./API/helpFunctions");
const userModel_1 = require("./API/User/userModel");
app.post("/send_recovery_email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.recipient_email;
        //@ts-ignore
        const emailExists = yield (0, helpFunctions_1.isItemExist)(userModel_1.UserModel, { email: email }); // Await the async function
        if (emailExists) {
            (0, mailService_1.sendEmail)(req.body)
                .then((response) => res.send(response))
                .catch((error) => res.status(500).send(error.message));
        }
        else {
            res.send("User email is not register, please register first");
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error while checking email existence");
    }
}));
// Connect to MongoDB
const connectToMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //with mongoose
        yield mongooseMongoDBConnection_1.default;
        //with native driver
        // await connectToDatabase();
        //with wrapper
        yield mongoDBWrapper_1.MongoDBWrapper.connectMongoDB();
    }
    catch (err) {
        console.error(err);
        process.exit(1); // Exit the process with a non-zero code
    }
});
connectToMongoDB()
    .then(() => {
    app.use((req, res, next) => {
        console.log(`Received request: ${req.method} ${req.url}`);
        next();
    });
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
})
    .catch((err) => {
    console.error(err);
});
//# sourceMappingURL=server.js.map