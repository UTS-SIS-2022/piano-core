import { InsertOneResult, MongoClient } from "mongodb";
import express from "express";
import { createComposition, getComposition } from "./controllers/compositions";
import {
  createUser,
  getAllUsers,
  isAuthenticated,
  logIn,
  logOut,
} from "./controllers/users";
const cors = require("cors");
const userSession = require("express-session");
var path = require("path");

// require dotenv to load environment variables
require("dotenv").config();
import { MongoGateway } from "./config/mongo";

export let db: MongoGateway;
// initialise gateways
(async () => {
  if (process.env.MONGO_CONNECTION_URI && process.env.PORT) {
    const client = new MongoClient(process.env.MONGO_CONNECTION_URI);
    await client.connect();
    db = new MongoGateway(
      client,
      client.db("music"),
      client.db("music").collection("users"),
      client.db("music").collection("compositions")
    );
  } else {
    throw new Error("Please check your environment variables");
  }
})();

// setup express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));
console.log(__dirname);

app.use(
  userSession({
    secret: "secret",
    cookie: { maxAge: 300000000 },
    saveUninitialized: false,
  })
);

// serve landing page
app.get("/", (req, res) => {
  // send css
  res.sendFile(__dirname + "/public/style.css");
  // serve landing page
  res.sendFile(__dirname + "/public/index.html");
  //serve js file
  res.sendFile(__dirname + "/public/script.js");

  res.sendFile(__dirname + "/public/helpers.js");
});

// start listening
app.listen(process.env.PORT, () => {
  if (!process.env.PORT) {
    throw new Error("PORT is undefined, check your environment variables");
  }
  console.log(`Listening on port ${process.env.PORT}!`);
});

// insert a new composition to mongodb
app.post("/api/session", async (req, res) => {
  const insertResult = await createComposition(req.body);
  res.status(200).send(insertResult);
  return;
});

app.post("/api/signup", async (req, res) => {
  const insertResult = await createUser(req, res);
  console.debug("Create User Response =>\n", insertResult);
  res.send(insertResult);
  return;
});

app.get("/api/users", async (req, res) => {
  const users = await getAllUsers();
  res.status(200).send(users);
  return;
});

app.post("/api/login", async (req: any, res: any) => {
  // this handles the response to the client - probably should be handled here
  // keep the users controller as pure functions
  console.log(req.sessionID);
  const logInResponse = await logIn(req, res);
  console.log(logInResponse);
  res.send(logInResponse);
});

app.post("/api/logout", async (req: any, res: any) => {
  console.log(req.sessionID);
  const logoutResponse = await logOut(req, res);
  res.send(logoutResponse);
});

app.get("/api/authenticated", async (req: any, res: any) => {
  console.log(req.sessionID);
  const autheticationResponse = await isAuthenticated(req, res);
  res.send(autheticationResponse);
});

app.get("/api/composition/:id", async (req: any, res: any) => {
  console.log(req.params.id);
  const compositionResponse = await getComposition(req.params.id);
  res.send(compositionResponse);
});

// retrieve compositions from mongodb by userid
app.get("/api/session", async (req: any, res) => {
  console.log("get session recieved");
  const user = req.session.user.username;
  db.compositionCollection
    .find({ $or: [{ userId: user }, { username: user }] })
    .toArray((err: any, result: any) => {
      if (err) throw console.error(err);
      console.log(result.length);

      res.send(result);
    });
});

app.use(express.static("public"));
