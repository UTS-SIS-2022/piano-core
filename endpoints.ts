import { MongoClient } from "mongodb";
import express from "express";
// require dotenv to load environment variables
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}!`)
);
// async function main() {
//   // create a new express rest endpoint
//   console.info(`Starting storage rest endpoint on port ${process.env.PORT}`);

//   //   app.get("/api/session", getSession);
// }

app.post("/api/session", async (req, res) => {
  if (!process.env.MONGO_URI) {
    console.log("MONGO_URI is not set");

    return;
  }
  const mongoClient = new MongoClient(process.env.MONGO_URI);
  try {
    await mongoClient.connect();
    const database = mongoClient.db("music");
    const collection = database.collection("sessions");
    const result = await collection.insertOne(req.body);
    console.log(
      `New session created with the following id: ${result.insertedId}`
    );
    return result.insertedId;
  } catch (e) {
    console.error(e);
  }
});
// app.post(, postSession);

// main();
