const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");
const exphbs = require("express-handlebars");

const methodOverride = require("method-override");

//Load config
dotenv.config({ path: "./config/config.env" });

// Passport config
require("./config/passport")(passport);

//MONGOOSE
connectDB();

const app = express();

// body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// logging
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

// handle bar helpers
const {
  formatDate,
  truncate,
  stripTags,
  editIcon,
  select,
} = require("./helpers/hbs");

//handlebars
app.engine(
  ".hbs",
  exphbs({
    helpers: { formatDate, truncate, stripTags, editIcon, select },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

// express sessions
const secret = process.env.SECRET || "thisshouldbeabettersecret!";

app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost/mystore" }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// global variables
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

//Static folder
app.use(express.static(path.join(__dirname, "public")));

//routes

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

app.listen(
  process.env.PORT || 3000,
  console.log(`Listening to the port 3000 in ${process.env.NODE_ENV} mode`)
);
