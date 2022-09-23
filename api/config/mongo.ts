import { Collection, Db, Document, MongoClient } from "mongodb";
import { Constants } from "./constants";

export class MongoGateway {
  static readonly MONGO_CONNECTION_URI: string;
  static readonly PORT: number;
  // public userCollection: any;
  // static userCollection: Collection<Document>;
  constructor(
    readonly client: MongoClient,
    readonly database: Db,
    readonly userCollection: Collection<Document>
  ) {
    console.log("Mongodb initialized");
  }
}
