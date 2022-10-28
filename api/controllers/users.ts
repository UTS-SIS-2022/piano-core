import bcrypt from "bcrypt";
import { db } from "../server";
const dotenv = require("dotenv");
dotenv.config();

export const getAllUsers = async () => {
  return await db.userCollection.find().toArray();
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
  // req.session = { authenticated: false };

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
    const data = {
      username: req.session.user.username,
      errors: ["Already Logged in"],
      message: "Already logged in",
    };
    res.status(200);
    return data;
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

export const isAuthenticated = async (req: any, res: any) => {
  if (req.session.user) {
    try {
      res.status(200);
      console.log(req.session.user.username);
      return {
        message: "Is authenticated",
        username: req.session.user.username,
      };
    } catch {
      res.status(500);
      return { message: "Uncaught error" };
    }
  } else {
    res.status(404);
    return { message: "Not authenticated" };
  }
};

export const logOut = async (req: any, res: any) => {
  if (req.session.user) {
    try {
      req.session.destroy();
      res.status(200);
      return { message: "Successfully logged out" };
    } catch {
      res.status(500);
      return { message: "Uncaught error" };
    }
  } else {
    return { message: "Must be Logged In" };
  }
};
