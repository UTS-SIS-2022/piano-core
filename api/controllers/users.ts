import bcrypt from "bcrypt";
import { Collection, Document, MongoClient, ObjectId } from "mongodb";
import { Constants } from "../config/constants";
import { MongoGateway } from "../config/mongo";
import { db } from "../server";
const dotenv = require("dotenv");
dotenv.config();

const users: any = [];
// var userCollection: any = MongoGateway.;
export const CONSTANTS = new Constants();

// executes automatically when this file is loaded

export const getAllUsers = async () => {
  users.push(...(await db.userCollection.find().toArray()));
  return users;
};

export const getUserFromDb = async (uid: string) => {
  const user = await db.userCollection.findOne({ _id: uid });
  return user;
};

export const createUser = async (req: any, res: any) => {
  try {
    const hashedPwd = await bcrypt.hash(req.body.user.password, 10);
    const user = {
      _id: req.body.user.username,
      username: req.body.user.username,
      password: hashedPwd,
    };

    const insertResponse = await db.userCollection.insertOne(user as any);
    users.push(user);
    res.status(200);
    const data = {
      _id: insertResponse.insertedId,
      username: req.body.user.username,
      success: true,
      mongoResponse: insertResponse,
      errors: null,
    };
    return data;
  } catch (err: any) {
    const data = {
      _id: null,
      username: null,
      success: false,
      mongoResponse: null,
      errors: err,
      message: err.message,
    };
    res.status(500);
    return data;
  }
};

export const logIn = async (req: any, res: any) => {
  req.session = { authenticated: false };

  const user = await getUserFromDb(req.body.user.username);
  if (user == null) {
    res.status(404);
    const data = {
      username: req.body.user.username,
      success: false,
      errors: ["User not found"],
      message: "User not found",
    };
    return data;
  }
  if (req.session?.authenticated) {
    res.status(200);
  } else {
    try {
      if (await bcrypt.compare(req.body.user.password, user.password)) {
        const data = {
          username: req.body.user.username,
          success: true,
          errors: [],
          message: "Login successful",
        };
        req.session.authenticated = true;
        req.session.user = { username: user.username };
        res.status(200);
        return data;
      } else {
        const data = {
          username: req.body.user.username,
          success: false,
          errors: ["Incorrect password"],
          message: "Login failed. Passwords do not match!",
        };
        res.status(500);
        return data;
      }
    } catch {
      res.status(500);
      return { message: "Uncaught error" };
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
    req.session.destroy();
    res.redirect("/");
  });
