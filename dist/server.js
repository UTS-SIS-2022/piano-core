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
exports.db = void 0;
const mongodb_1 = require("mongodb");
const express_1 = __importDefault(require("express"));
const compositions_1 = require("./controllers/compositions");
const users_1 = require("./controllers/users");
const cors = require("cors");
const userSession = require("express-session");
var path = require("path");
// require dotenv to load environment variables
require("dotenv").config();
const mongo_1 = require("./config/mongo");
// initialise gateways
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.MONGO_CONNECTION_URI && process.env.PORT) {
        const client = new mongodb_1.MongoClient(process.env.MONGO_CONNECTION_URI);
        yield client.connect();
        exports.db = new mongo_1.MongoGateway(client, client.db("music"), client.db("music").collection("users"), client.db("music").collection("compositions"));
    }
    else {
        throw new Error("Please check your environment variables");
    }
}))();
// setup express
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(cors());
app.use(express_1.default.static(__dirname + "/public"));
console.log(__dirname);
app.use(userSession({
    secret: "secret",
    cookie: { maxAge: 300000000 },
    saveUninitialized: false,
}));
// serve landing page
app.get("/", (req, res) => {
    // serve landing page
    res.sendFile(__dirname + "/public/index.html");
    //serve js file
    res.sendFile(__dirname + "/public/script.js");
    res.sendFile(__dirname + "/public/style.css");
    res.sendFile(__dirname + "/public/helpers.js");
});
// start listening
app.listen(process.env.PORT, () => {
    if (!process.env.PORT) {
        throw new Error("PORT is undefined, check your environment variables");
    }
    console.log(`Listening on port ${process.env.PORT}!`);
});
// insert a new composition to mongodb
app.post("/api/session", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const insertResult = yield (0, compositions_1.createComposition)(req.body);
    res.status(200).send(insertResult);
    return;
}));
app.post("/api/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const insertResult = yield (0, users_1.createUser)(req, res);
    console.debug("Create User Response =>\n", insertResult);
    res.send(insertResult);
    return;
}));
app.get("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield (0, users_1.getAllUsers)();
    res.status(200).send(users);
    return;
}));
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // this handles the response to the client - probably should be handled here
    // keep the users controller as pure functions
    console.log(req.sessionID);
    const logInResponse = yield (0, users_1.logIn)(req, res);
    console.log(logInResponse);
    res.send(logInResponse);
}));
app.post("/api/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.sessionID);
    const logoutResponse = yield (0, users_1.logOut)(req, res);
    res.send(logoutResponse);
}));
app.get("/api/authenticated", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.sessionID);
    const autheticationResponse = yield (0, users_1.isAuthenticated)(req, res);
    res.send(autheticationResponse);
}));
app.get("/api/composition/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params.id);
    const compositionResponse = yield (0, compositions_1.getComposition)(req.params.id);
    res.send(compositionResponse);
}));
// retrieve compositions from mongodb by userid
app.get("/api/session", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("get session recieved");
    const user = req.session.user.username;
    exports.db.compositionCollection
        .find({ $or: [{ userId: user }, { username: user }] })
        .toArray((err, result) => {
        if (err)
            throw console.error(err);
        console.log(result.length);
        res.send(result);
    });
}));
app.use(express_1.default.static("public"));
