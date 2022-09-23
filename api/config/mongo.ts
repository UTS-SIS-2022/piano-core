import { Collection, Db, Document, MongoClient } from "mongodb";

export class MongoGateway {
  static readonly MONGO_CONNECTION_URI: string;
  static readonly PORT: number;
  constructor(
    readonly client: MongoClient,
    readonly database: Db,
    readonly userCollection: Collection<Document>,
    readonly compositionCollection: Collection<Document>
  ) {
    console.log("Mongodb initialized");
  }
}
