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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComposition = exports.retrieveCompositions = exports.createComposition = void 0;
const mongodb_1 = require("mongodb");
const server_1 = require("../server");
/**
 * Create a new composition in the database
 *
 * @export
 * @param {NoteSequence} noteSequence
 * @return {*}  {Promise<InsertOneResult<Document>>}
 */
function createComposition(noteSequence // contains userId
) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield server_1.db.compositionCollection.insertOne(noteSequence);
            console.log(`New session created with the following id: ${result.insertedId}`);
            return result;
        }
        catch (e) {
            console.error(e);
            return e;
        }
    });
}
exports.createComposition = createComposition;
/**
 * Retrieve a set of compositions from the database for a given user
 *
 * @export
 * @param {string} user
 * @return {*} returns a cursor to the set of compositions
 */
function retrieveCompositions(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const documentPointer = server_1.db.compositionCollection.find({ user: user });
            console.log(documentPointer);
            return documentPointer;
        }
        catch (e) {
            console.error(e);
            return e;
        }
    });
}
exports.retrieveCompositions = retrieveCompositions;
function getComposition(id) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(id);
        try {
            return yield server_1.db.compositionCollection.findOne({
                _id: new mongodb_1.ObjectId(id),
            });
        }
        catch (e) {
            console.error(e);
            return e;
        }
    });
}
exports.getComposition = getComposition;
