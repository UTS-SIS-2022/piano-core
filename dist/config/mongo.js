"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoGateway = void 0;
class MongoGateway {
    constructor(client, database, userCollection, compositionCollection) {
        this.client = client;
        this.database = database;
        this.userCollection = userCollection;
        this.compositionCollection = compositionCollection;
        console.log("Mongodb initialized");
    }
}
exports.MongoGateway = MongoGateway;
