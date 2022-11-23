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
exports.logOut = exports.isAuthenticated = exports.logIn = exports.createUser = exports.getUserFromDb = exports.getAllUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const server_1 = require("../server");
const dotenv = require("dotenv");
dotenv.config();
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield server_1.db.userCollection.find().toArray();
});
exports.getAllUsers = getAllUsers;
const getUserFromDb = (uid) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield server_1.db.userCollection.findOne({ _id: uid });
    return user;
});
exports.getUserFromDb = getUserFromDb;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPwd = yield bcrypt_1.default.hash(req.body.user.password, 10);
        const user = {
            _id: req.body.user.username,
            username: req.body.user.username,
            password: hashedPwd,
        };
        const insertResponse = yield server_1.db.userCollection.insertOne(user);
        res.status(200);
        const data = {
            _id: insertResponse.insertedId,
            username: req.body.user.username,
            success: true,
            mongoResponse: insertResponse,
            errors: null,
        };
        return data;
    }
    catch (err) {
        const data = {
            _id: null,
            username: null,
            success: false,
            mongoResponse: null,
            errors: err,
            message: err.message,
        };
        res.status(500);
        return data;
    }
});
exports.createUser = createUser;
const logIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // req.session = { authenticated: false };
    var _a;
    const user = yield (0, exports.getUserFromDb)(req.body.user.username);
    if (user == null) {
        res.status(404);
        const data = {
            username: req.body.user.username,
            success: false,
            errors: ["User not found"],
            message: "User not found",
        };
        return data;
    }
    if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.authenticated) {
        const data = {
            username: req.session.user.username,
            errors: ["Already Logged in"],
            message: "Already logged in",
        };
        res.status(200);
        return data;
    }
    else {
        try {
            if (yield bcrypt_1.default.compare(req.body.user.password, user.password)) {
                const data = {
                    username: req.body.user.username,
                    success: true,
                    errors: [],
                    message: "Login successful",
                };
                req.session.authenticated = true;
                req.session.user = { username: user.username };
                res.status(200);
                return data;
            }
            else {
                const data = {
                    username: req.body.user.username,
                    success: false,
                    errors: ["Incorrect password"],
                    message: "Login failed. Passwords do not match!",
                };
                res.status(500);
                return data;
            }
        }
        catch (_b) {
            res.status(500);
            return { message: "Uncaught error" };
        }
    }
});
exports.logIn = logIn;
const isAuthenticated = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.user) {
        try {
            res.status(200);
            console.log(req.session.user.username);
            return {
                message: "Is authenticated",
                username: req.session.user.username,
            };
        }
        catch (_c) {
            res.status(500);
            return { message: "Uncaught error" };
        }
    }
    else {
        res.status(404);
        return { message: "Not authenticated" };
    }
});
exports.isAuthenticated = isAuthenticated;
const logOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.user) {
        try {
            req.session.destroy();
            res.status(200);
            return { message: "Successfully logged out" };
        }
        catch (_d) {
            res.status(500);
            return { message: "Uncaught error" };
        }
    }
    else {
        return { message: "Must be Logged In" };
    }
});
exports.logOut = logOut;
