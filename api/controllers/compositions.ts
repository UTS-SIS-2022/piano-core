import { NoteSequence } from "@magenta/music";
import { FindCursor, InsertOneResult, MongoClient, ObjectId } from "mongodb";
import { db } from "../server";

/**
 * Create a new composition in the database
 *
 * @export
 * @param {NoteSequence} noteSequence
 * @return {*}  {Promise<InsertOneResult<Document>>}
 */
export async function createComposition(
  noteSequence: NoteSequence // contains userId
): Promise<InsertOneResult<Document>> {
  try {
    const result: InsertOneResult<Document> =
      await db.compositionCollection.insertOne(noteSequence);
    console.log(
      `New session created with the following id: ${result.insertedId}`
    );
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
  try {
    const documentPointer = db.compositionCollection.find({ user: user });
    console.log(documentPointer);
    return documentPointer;
  } catch (e: any) {
    console.error(e);
    return e;
  }
}

export async function getComposition(id: string) {
  console.log(id);
  try {
    return await db.compositionCollection.findOne({
      _id: new ObjectId(id),
    });
  } catch (e: any) {
    console.error(e);
    return e;
  }
}
