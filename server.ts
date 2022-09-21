import { InsertOneResult, MongoClient } from "mongodb";
import express from "express";
import { createComposition } from "./controllers/compositions";
import { createUser, getUsers, logIn } from "./controllers/users";
// import { } from "./controllers/users";
// import { UserRepo } from "./controllers/users";
// import { MONGO_CONNECTION_URI } from "./config/constants";
const cors = require("cors");
const userSession = require("express-session");
// const store = new userSession.MemoryStore();

// require dotenv to load environment variables
require("dotenv").config();
import { MongoGateway } from "./config/mongo";

(async () => {
  await new MongoGateway().initRepo();
  console.log("MongoGateway initialized");
})();
// export const userRepo = new UserRepo();

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

app.post("/api/signup", async (req, res) => {
  if (!process.env.MONGO_CONNECTION_URI) {
    console.log("MONGO_URI is not set");
    res.send(500);
    return;
  } else {
    // console.log(app);
    debugger;
    const insertResult = await createUser(req, res);
    console.debug("Create User Response =>\n", insertResult);
    res.send(insertResult);
    return;
  }
});

app.get("api/users", async (req, res) => {
  if (!process.env.MONGO_CONNECTION_URI) {
    console.log("MONGO_URI is not set");
    res.send(500);
    return;
  } else {
    const users = await getUsers(req, res);
    res.status(200).send(users);
    return;
  }
});

app.post("/api/login", async (req, res) => {
  if (!process.env.MONGO_CONNECTION_URI) {
    console.log("MONGO_URI is not set");
    res.send(500);
    return;
  } else {
    // this handles the response to the client - probably should be handled here
    // keep the users controller as pure functions
    const logInResponse = await logIn(req, res);
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
  })
);

app.use(express.static("public"));

// app.use("/users", require("./routes/users"));
