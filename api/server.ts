import { InsertOneResult, MongoClient } from "mongodb";
import express, { response } from "express";
import { createComposition } from "./controllers/compositions";
import { createUser, getAllUsers, isAuthenticated, logIn, logOut } from "./controllers/users";
const cors = require("cors");
const userSession = require("express-session");

// require dotenv to load environment variables
require("dotenv").config();
import { MongoGateway } from "./config/mongo";
import { any } from "prop-types";
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
app.use(express.static("public"));

app.use(
  userSession({
    secret: "secret",
    cookie: { maxAge: 300000000 },
    saveUninitialized: false,
  })
);

// serve landing page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//serve compositions page of a userId
app.get("/123", (req, res) => {
  res.sendFile(__dirname + "/compositions.html");
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
  res.send(logInResponse);
});

app.post("/api/logout", async (req: any, res: any) => {
  console.log(req.sessionID);
  const logoutResponse = await logOut(req, res);
  res.send(logoutResponse);
})

app.get("/api/authenticated", async (req: any, res: any) => {
  console.log(req.sessionID);
  const autheticationResponse = await isAuthenticated(req, res);
  res.send(autheticationResponse);
  
})

// retrieve compositions from mongodb by userid
app.get("/api/session", async (req, res) => {
  console.log("get session recieved");
  db.compositionCollection.find({}).toArray((err, result) => {
    if (err) throw console.error(err)
    res.send(result)
  })
});

app.use(express.static("public"));
