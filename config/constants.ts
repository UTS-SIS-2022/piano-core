export class Constants {
  static readonly MONGO_CONNECTION_URI: string;
  static readonly PORT: number;
  musicDatabase: any;
  userCollection: any;
  compositionCollection: any;
  constructor(
    readonly MONGO_CONNECTION_URI = process.env.MONGO_CONNECTION_URI,
    readonly PORT = process.env.PORT
  ) {
    console.log("Constants initialized", this);
  }
}
