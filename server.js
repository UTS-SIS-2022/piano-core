const express = require('express');
const app = express();
const path = require('path');
require("dotenv").config();

app.use(express.static("public"))

const users = [{
    username: "Andrew",
    password: "Jackson123",
}];

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname))
})

app.get("/users", (req, res) => {
   res.json(users); 
})

app.listen(process.env.PORT);