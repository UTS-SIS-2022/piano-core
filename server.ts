import { InsertOneResult, MongoClient } from "mongodb";
import express from "express";
// require dotenv to load environment variables
require("dotenv").config();
const cors = require("cors");
const userSession = require("express-session");
const store = new userSession.MemoryStore();
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}!`)
);

app.post("/api/session", async (req, res) => {
  if (!process.env.MONGO_CONNECTION_URI) {
    console.log("MONGO_URI is not set");

    return;
  }
  const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_URI);
  try {
    await mongoClient.connect();
    const database = mongoClient.db("music");
    const collection = database.collection("sessions");
    const result: InsertOneResult<Document> = await collection.insertOne(
      req.body
    );
    console.log(
      `New session created with the following id: ${result.insertedId}`
    );
    return result.insertedId;
  } catch (e) {
    console.error(e);
  }
});

app.get("/api/session", async (req, res) => {
  console.log("get session recieved");
});

app.use((req: any, res: any, next: () => void) => {
  console.log(store);
  next();
});

app.use(
  userSession({
    secret: "secret",
    cookie: { maxAge: 300000000 },
    saveUninitialized: false,
    store,
  })
);

app.use(express.static("public"));

app.get("/", (req: any, res: any) => {
  res.sendFile(path.join(__dirname));
});

app.use("/users", require("./routes/users"));
