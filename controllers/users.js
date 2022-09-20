const bcrypt = require('bcrypt');
const fs = require('fs');

// let rawUserData = fs.readFileSync("users.json");
// let users = JSON.parse(rawUserData);

const users = [];

const getUsers = ((req, res) => {
    console.log(users);
    return res.send(users);
});

const createUser = (async (req, res) => {
    try {
        const hashedPwd = await bcrypt.hash(req.body.user.password, 10);
        const user = { "username": req.body.user.username, password: hashedPwd }
        users.push(user);
        console.log(users);
        res.send(users);
    } catch {
        res.status(500).send();
    }
    
})

const logIn = (async (req, res) => {
    console.log(req.sessionID);
    const user = users.find(user => user.username = req.body.user.username);
    if (req.session.authenticated) {
        res.json(req.session)
    } else {
        if (user == null) {
            return res.status(400).send("Cannot find user")
        }
         try {
             if(await bcrypt.compare(req.body.user.password, user.password)){
                req.session.authenticated = true;
                req.session.user = { username: user.username };
                res.send(req.session)
             } else {
                res.send("Not allowed")
             }
        } catch {
             res.status(500).send()
        }
    }
})

const isAuthenticated = (req, res, next) => {
    if(req.session.user) next();
    else res.status(400).send("You must be logged in");
}

const logOut = (isAuthenticated, async (req, res, next) => {
    console.log(req.sessionID);
    req.session.destroy();
    res.redirect("/");
})

module.exports = {
    getUsers,
    createUser,
    logIn,
    logOut,
}