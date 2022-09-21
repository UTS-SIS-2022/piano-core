import bcrypt from "bcrypt";
import { Collection, Document, MongoClient, ObjectId } from "mongodb";
import { Constants } from "../config/constants";
import { MongoGateway } from "../config/mongo";
const dotenv = require("dotenv");
dotenv.config();

const users: any = [];
var userCollection: any = MongoGateway.userCollection;
export const CONSTANTS = new Constants();

// executes automatically when this file is loaded

export const getUsers = async (req: any, res: any) => {
  users.push(...(await userCollection.find().toArray()));
  // console.log(users);
  return res.send(users);
};

export const createUser = async (req: any, res: any) => {
  // console.log(req.body.user);
  const userCollection = MongoGateway.userCollection;
  try {
    const hashedPwd = await bcrypt.hash(req.body.user.password, 10);
    const user = {
      _id: req.body.user.username,
      username: req.body.user.username,
      password: hashedPwd,
    };

    const insertResponse = await userCollection.insertOne(user as any);
    users.push(user);
    // console.log(users);
    // res.send(insertResponse);
    res.status(200);
    return insertResponse;
  } catch (err: any) {
    res.status(500);
    return err;
  }
};

export const logIn = async (req: any, res: any) => {
  // console.log(req.session);
  req.session.authenticated = true;
  const user = users.find(
    (user: any) => (user.username = req.body.user.username)
  );
  if (req.session?.authenticated) {
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

export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session.user) next();
  else res.status(400).send("You must be logged in");
};

export const logOut =
  (isAuthenticated as any,
  async (req: any, res: any, next: any) => {
    // console.log(req.sessionID);
    req.session.destroy();
    res.redirect("/");
  });

// module.exports = {
//   getUsers,
//   createUser,
//   logIn,
//   logOut,
// };
