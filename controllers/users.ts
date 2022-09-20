import bcrypt from "bcrypt";
import { Collection, Document, MongoClient } from "mongodb";
import { CONSTANTS } from "../server";

const users: any = [];
var userCollection: Collection<Document>;

// executes automatically when this file is loaded
(async () => {
  const client = new MongoClient(CONSTANTS.MONGO_CONNECTION_URI as string);
  await client.connect();
  const database = client.db("music");
  userCollection = database.collection("users");
})();

const getUsers = async (req: any, res: any) => {
  users.push(...(await userCollection.find().toArray()));
  console.log(users);
  return res.send(users);
};

const createUser = async (req: any, res: any) => {
  try {
    const hashedPwd = await bcrypt.hash(req.body.user.password, 10);
    const user = {
      _id: req.body.user.username,
      username: req.body.user.username,
      password: hashedPwd,
    };
    await userCollection.insertOne(user);
    users.push(user);
    console.log(users);
    res.send(users);
  } catch {
    res.status(500).send();
  }
};

const logIn = async (req: any, res: any) => {
  console.log(req.sessionID);
  const user = users.find(
    (user: any) => (user.username = req.body.user.username)
  );
  if (req.session.authenticated) {
    res.json(req.session);
  } else {
    if (user == null) {
      // refresh local cache of users
      await getUsers(req, res);
      // if we still cant find the user, return a 400
      if (
        users.find((user: any) => (user.username = req.body.user.username)) ==
        null
      ) {
        return res.status(400).send("Cannot find user");
      }
    }
    try {
      if (await bcrypt.compare(req.body.user.password, user.password)) {
        req.session.authenticated = true;
        req.session.user = { username: user.username };
        res.send(req.session);
      } else {
        res.send("Not allowed");
      }
    } catch {
      res.status(500).send();
    }
  }
};

const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session.user) next();
  else res.status(400).send("You must be logged in");
};

const logOut =
  (isAuthenticated as any,
  async (req: any, res: any, next: any) => {
    console.log(req.sessionID);
    req.session.destroy();
    res.redirect("/");
  });

module.exports = {
  getUsers,
  createUser,
  logIn,
  logOut,
};
