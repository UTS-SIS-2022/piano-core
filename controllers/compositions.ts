import { NoteSequence } from "@magenta/music";
import { FindCursor, InsertOneResult, MongoClient } from "mongodb";
import { CONSTANTS } from "../server";

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

/**
 * Retrieve a set of compositions from the database for a given user
 *
 * @export
 * @param {string} user
 * @return {*} returns a cursor to the set of compositions
 */
export async function retrieveCompositions(user: string): Promise<FindCursor> {
  const mongoClient = new MongoClient(CONSTANTS.MONGO_CONNECTION_URI as string);
  try {
    await mongoClient.connect();
    const database = mongoClient.db("music");
    const collection = database.collection("sessions");
    const documentPointer = collection.find({ user: user });
    console.log(documentPointer);
    await mongoClient.close();
    return documentPointer;
  } catch (e: any) {
    console.error(e);
    return e;
  }
}
