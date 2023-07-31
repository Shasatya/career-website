const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(session({
    secret: "This is a long string", // telling our app to use the session package
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize()); // telling our app to initialize and use passport

app.use(passport.session()); // telling our app to use passport to manage session
//mongoose.set("useCreateIndex", true);

mongoose.connect('mongodb://127.0.0.1:27017/testcaseDB');

let userSchema = new mongoose.Schema({
    name: String,
    email: String,
    course: String,
    password: String
});

userSchema.plugin(passportLocalMongoose); // just like mongoose-encryption

let User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, cb) {
    process.nextTick(function () { // passport.serializeUser(User.serializeUser()); creating cookie with message in it
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () { // passport.deserializeUser(User.deserializeUser()); crushing the cookie and reading the message with the help of passport
        return cb(null, user);
    });
});

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/courses", (req, res) => {
    res.render("courses");
});


app.get("/testpage", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("testpage");
    } else {
        res.redirect("/login");
    }
});

app.post("/signup", function (req, res) {

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/signup");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/testpage");
            });
        }
    });
});

app.post("/login", function (req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/testpage");
            });
        }
    });

});

app.get("/logout", (req, res) => {   // order is important --> put after all passport functions
    req.logout((err) => {
      // console.log("req.logout is working ");
    });
    res.redirect("/");
  });

app.listen(3000, () => {
    console.log("Server started on port http://localhost:3000");
});