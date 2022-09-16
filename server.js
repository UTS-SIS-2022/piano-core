const express = require('express');
const session = require("express-session");
const store = new session.MemoryStore();
const app = express();
const path = require('path');
require("dotenv").config();

app.use((req, res, next) => {
    console.log(store);
    next();
})

app.use(session({
    secret: "secret",
    cookie: { maxAge: 300000000 },
    saveUninitialized: false,
    store
}))

app.use(express.static("public"))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname))
})

app.use("/users", require('./routes/users'))

app.listen(process.env.PORT, async () => {
    console.log(`Server running on port: ${process.env.PORT}`);
});