import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from "cookie-parser"; // for setting the cookies
import jwt from "jsonwebtoken"; // for setting the jwt token for authentication
import bcrypt from "bcrypt"; // for hashing the password in database

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbname: "backend",
})
.then(() => console.log("Database connected"))
.catch((e) => console.log(e));

const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", messageSchema);

const app = express();

// const users = [];

// Using Middlewares
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Setting up View engine
app.set("view engine", "ejs");

// we can use it as a middleware for testing

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if(token){

        const decoded = jwt.verify(token, "redftgyhujikolpwsqa");
        req.user = await User.findById(decoded._id);

        next();
    } else {
        res.redirect("/login");
    }
};
app.get("/", isAuthenticated, (req, res, ) => {
    // console.log(req.cookies);
    // const { token } = req.cookies;
    // if(token){
    //     res.render("logout");
    // } else {
    //     res.render("login");
    // }
    res.render("logout", {name: req.user.name});
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register",  (req, res, ) => {
    res.render("register");
});

app.post("/login", async (req, res) => {

    const { email, password } = req.body;
    let user = await User.findOne({email});

    if (!user)  return res.redirect("/register");

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) return res.render ("login", { email, message : "Incorrect password"});

    const token = jwt.sign({_id: user._id }, "redftgyhujikolpwsqa");
       res.cookie("token", token, {
        httpOnly:true,
        expires: new Date(Date.now() + 60 * 1000),
       });
       res.redirect("/");
})

app.post("/register", async (req, res) => {
    const {name, email, password} = req.body;

    let user = await User.findOne({email});
    if(user) {
        return res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(password, 10);


     user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = jwt.sign({_id: user._id }, "redftgyhujikolpwsqa");
       res.cookie("token", token, {
        httpOnly:true,
        expires: new Date(Date.now() + 60 * 1000),
       });
       res.redirect("/");
});

app.get("/logout", (req, res) => {
    res.cookie("token", null, {
     httpOnly:true,
     expires: new Date(Date.now()),
    });
    res.redirect("/");
});

// app.get('/', (req, res) => {

//     res.render("index");
//     // const pathlocation = path.resolve();
//     // res.sendFile(path.join(pathlocation, './index.html'));

//     // res.sendFile("index");
// });

// app.get("/add", async (req, res) => {
//     await Messge.create({ name: "Vimal Anand", email: "samples@example.com"});
//     res.send("Data Saved !");
// });

// app.get("/success", (req, res) => {
//     res.render("success");
// });

// app.post("/contact", async (req, res) => {
//     // console.log(req.body);
//     // pushing array in this api to collect the dummy data !
//     // users.push({username: req.body.name, email: req.body.email});
//     // res.render("success");
//     const {name, email} = req.body;
//     await Messge.create({name, email});
//     res.redirect("/success");
// });


// app.get("/users", (req, res) => {
//     res.json ({
//         users,
//     });
// });
app.listen(5000, () =>{
    console.log("app is working");
});



// import http from "http";


// import {generateLovePercent} from "./features.js";
// console.log(generateLovePercent());

// const server = http.createServer((req, res)=>{
//     if(req.url === "/about"){
//         res.end(`<h1>Love is ${generateLovePercent()} </h1>`);
//     } else {
//         res.end("<h1> Page Not Found </h1>");
//     }
// });

// server.listen(5000,()=>{
//     console.log("server is working");
// });

