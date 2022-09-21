import { Collection, MongoClient } from "mongodb";
import { Constants } from "./constants";

export class MongoGateway {
  static readonly MONGO_CONNECTION_URI: string;
  static readonly PORT: number;
  constants;
  client: MongoClient | undefined;
  database: any;
  // public userCollection: any;
  static userCollection: Collection<Document>;
  constructor(
    readonly MONGO_CONNECTION_URI = process.env.MONGO_CONNECTION_URI,
    readonly PORT = process.env.PORT
  ) {
    console.log("Constants initialized", this);
    this.constants = new Constants(this.MONGO_CONNECTION_URI, this.PORT);
  }
  async initRepo() {
    if (!this.MONGO_CONNECTION_URI) {
      console.log("MONGO_URI is not set");
      throw new Error("MONGO_URI is not set");
    } else {
      this.client = new MongoClient(this.MONGO_CONNECTION_URI);
      await this.client.connect();
      this.database = this.client.db("music");
      MongoGateway.userCollection = this.database.collection("users");
    }
  }
}
