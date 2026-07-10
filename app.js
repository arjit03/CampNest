// Environment variables are variables that
// exist outside your application's code and are made available to the program while it is running.

// process is a global object available inside node js
// inside it there's process.env which holds those enviornment variables
// theres a property inside process.env called process.env.NODE_ENV
// which contains the phase of current project i.e, (development, production, test)
// by default its in development, and if its in de velopment we keep the secrets inside .env files
// if in production we enter those variables inside servers enviornment variable so we dont need the .env file there
// but our code remains the same to access env variables in both cases!

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // requiring the dotenv module we installed (npm i dotenv)
  // and using its .config() method, which attaches key value pairs inside the .env file to process.env.
  // basically parses it.
}
console.log(process.env.CLOUD_NAME); // printing SECRET define in .env file!

const express = require("express");
const path = require("path");
const { MongoStore } = require("connect-mongo");
// const helmet = require("helmet");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const app = express();
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStratergy = require("passport-local");
const User = require("./models/user");
const authRoutes = require("./routes/auth");
const secret = process.env.SECRET || "thisshouldbeabettersecret!";
const port = process.env.PORT || 3000;

// EJS = template engine that embeds js into html and generates final html

// ejs-mate = enhanced rendering engine/helper built on top of EJS that adds features like layouts and boilerplates

// app.set("view engine", "ejs")
// = tells Express that our template/view files are .ejs files
// or we can say we tell express we are using ejs templates

// app.engine("ejs", ejsMate)
// = tells Express to use ejsMate as the rendering engine for .ejs files instead of default EJS rendering

const store = MongoStore.create({
  mongoUrl: process.env.DB_URL,
  crypto: {
    secret,
  },
  touchAfter: 24 * 60 * 60, // Reduce unnecessary session updates (1 day)
});

store.on("error", (err) => {
  console.log("SESSION STORE ERROR:", err);
});

const sessionConfig = {
  store,
  secret,
  name: "Session", // setting name of the sessionID cookie from default name to our own name!
  resave: false,
  saveUninitialized: false,
  cookie: {
    // secure: true, // Cookie will only be sent over HTTPS.
    // It won't work over plain HTTP (e.g., most localhost setups).
    // Enable this in production.

    // httpOnly :-
    // Prevents JavaScript from accessing the cookie.
    // This helps protect against XSS attacks.
    httpOnly: true,
    // expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    // don't need to set expires! since it will be automatically calculated for us by using maxAge by express-session
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // Express converts maxAge into an Expires date internally (Expires) Property.
    // calculation :
    // 1000 ms  = 1 second
    // 60 sec   = 1 minute
    // 60 min   = 1 hour
    // 24 hr    = 1 day
    // 7 days   = 1 week
    // so : maxAge = 604800000 ms
    // The cookie will expire 1 week after it is set.
  },
};
// app.use(helmet());
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public"))); // serving public folder to the server
app.use(session(sessionConfig));
app.use(flash()); // initializing flash.
app.use(passport.initialize()); // initilizing passport. so we can use req.passport methods!
app.use(passport.session()); // allows persistent user logged in during future request using session

// helmet allows us to add extra security. by setting some additional headers
//content-security-policy is one of them which tell the browser what is allowed to load on our app
// and what not, also using helmet as middleware, it enables all 11 middlewares, which we dont see
// but are there!
// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net",
//   "https://cdn.maptiler.com/",
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.mapbox.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com/",
//   "https://cdn.maptiler.com/",
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
//   "https://api.maptiler.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", "blob:"],
//       objectSrc: [],
//       imgSrc: [
//         "'self'",
//         "blob:",
//         "data:",
//         "https://res.cloudinary.com/nyglhfc5/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
//         "https://images.unsplash.com/",
//         "https://api.maptiler.com/",
//       ],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   }),
// );

passport.use(new localStratergy(User.authenticate())); // this line menas:
// hey passport, use the localstratergy and authenticate users on the User model
passport.serializeUser(User.serializeUser());
// Tells Passport how to store the user in the session (stores user ID).

passport.deserializeUser(User.deserializeUser());
// Tells Passport how to retrieve the user from the session ID. ( uses the stored userID and finds corresponsding user with that ID in DB)
// and attaches that user to req.user

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user; // req.user is the object defined by passport which contains
  // the current users data when logged in otherwise its undefined
  // it is done using deserialization since it basically finds the users first using serialized info which is the id
  // from the database. and then attaches that to the req.user
  next();
});

// mongoose.connect("mongodb://localhost:27017/campnest");
mongoose.connect(process.env.DB_URL);
mongoose.connection.on("error", (err) => {
  console.log("Error :", err);
});
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

app.listen(port, () => {
  console.log("Running on port 3000");
});

app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);
app.use("/auth", authRoutes);

app.get("/", async (req, res) => {
  res.render("home");
});

// app.get("/fake", async (req, res) => { // register method DEMO
//   const user = new User({
//     email: "aaaaaaa",
//     username: "arjittt",
//   });
//   const storedUser = await User.register(user, "password");
//   // User.register() - it take a user documentt/instance that we wanna store in DB with (username) and other fields if given.
//   // and a pssword as second argument, and store hash and salt of that password in the db along with other properties.
//   console.log(storedUser);
// });

//Defing a catch all route using app.all
// app.all catches a specific route with any http verb.
app.all("/*splat", (req, res) => {
  throw new ExpressError("Page Not Found", 404);
});

// Defining error handler middleware
app.use((err, req, res, next) => {
  const { status = 500 } = err;
  res.status(status).render("error", { err });
});
