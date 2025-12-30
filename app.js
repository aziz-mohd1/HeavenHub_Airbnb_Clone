if(process.env.NODE_ENV != 'production'){
  require("dotenv").config();
}


const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// setup view engine to ejs
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// setup for static files
app.use(express.static(path.join(__dirname, "public")));

// setup parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// setup method-override
app.use(methodOverride("_method"));

// use templates with ejs-mate
app.engine("ejs", ejsMate);

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { error } = require("console");

// const MONGO_URL = "mongodb://127.0.0.1:27017/HeavenHub";
const dbUrl = process.env.ATLASDB_URL;

// settingUp mongoose
main()
  .then((res) => {
    console.log("Connection Successful!");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE ", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// app.get("/", (req, res) => {
//   res.send("Im Root!");
// });

app.use(session(sessionOptions));
app.use(flash()); 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  // console.log( res.locals.success );
  next();
});

// app.get("/demouser", async (req, res) => {      // just for practice.. main is in ./routes/user.js
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld"); // syntax => model.register(user, password, callBack) {...}
//   console.log(registeredUser);
//   res.send(registeredUser);
// });

// created differents  routes for listings and reviews using express routers... (in routes folder)
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
    res.render("home");  // looks for views/home.ejs
});

// Joi
/*const validateListing = validateSchema(listingSchema);
const validateReview = validateSchema(reviewSchema);

function validateSchema(schema) {
  return (req, res, next) => {
    let { error } = schema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else next();
  };
}
*/

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the Beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();

//   console.log("Successful testing!");

// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(port, () => {
  console.log(`Listening to the port: ${port}`);
});
