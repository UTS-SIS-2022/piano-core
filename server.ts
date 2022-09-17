import { InsertOneResult, MongoClient } from "mongodb";
import express from "express";
import { createComposition } from "./controllers/compositions";
import { Constants } from "./config/constants";
// import { MONGO_CONNECTION_URI } from "./config/constants";
const cors = require("cors");
const userSession = require("express-session");
const store = new userSession.MemoryStore();

// require dotenv to load environment variables
require("dotenv").config();
export const CONSTANTS = new Constants();

// setup express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// serve landing page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// start listening
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}!`);
});

// insert a new composition to mongodb
app.post("/api/session", async (req, res) => {
  if (!process.env.MONGO_CONNECTION_URI) {
    console.log("MONGO_URI is not set");
    res.send(500);
    return;
  } else {
    const insertResult = await createComposition(req.body);
    res.status(200).send(insertResult);
    return;
  }
});

// retrieve compositions from mongodb by userid
app.get("/api/session", async (req, res) => {
  console.log("get session recieved");
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

app.use("/users", require("./routes/users"));
// function loadConstants(): number | (() => void) | undefined {
//   MONGO_CONNECTION_URI = process.env.MONGO_CONNECTION_URI as string;
// }
