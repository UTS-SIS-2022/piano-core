import { NoteSequence } from "@magenta/music";
import { InsertOneResult, MongoClient } from "mongodb";
import { CONSTANTS } from "../server";
require("dotenv").config();

/**
 * Create a new composition in the database
 *
 * @export
 * @param {NoteSequence} noteSequence
 * @return {*}  {Promise<InsertOneResult<Document>>}
 */
export async function createComposition(
  noteSequence: NoteSequence
): Promise<InsertOneResult<Document>> {
  const mongoClient = new MongoClient(CONSTANTS.MONGO_CONNECTION_URI as string);
  try {
    await mongoClient.connect();
    const database = mongoClient.db("music");
    const collection = database.collection("sessions");
    const result: InsertOneResult<Document> = await collection.insertOne(
      noteSequence
    );
    console.log(
      `New session created with the following id: ${result.insertedId}`
    );
    await mongoClient.close();
    return result;
  } catch (e: any) {
    console.error(e);
    return e;
  }
}

export async function retrieveCompositions(user: string) {
  const mongoClient = new MongoClient(CONSTANTS.MONGO_CONNECTION_URI as string);
  try {
    await mongoClient.connect();
    const database = mongoClient.db("music");
    const collection = database.collection("sessions");
    const result = await collection.find({ user: user });
    console.log(result);
    await mongoClient.close();
    return result;
  } catch (e: any) {
    console.error(e);
    return e;
  }
}
