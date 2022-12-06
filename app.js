var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");

const Video = require("./models/videos");
const Lesson = require("./models/lessons");
const Quiz = require("./models/quiz");
const Question = require("./models/questions");
const Course = require("./models/courses");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var courseRouter = require("./routes/courseRouter");
var progressRouter = require("./routes/progressRouter");

const Connect = require("connect-pg-simple");
const session = require("express-session");

const DEFAULT_ADMIN = {
  email: "admin@example.com",
  password: "password",
};

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

const ConnectSession = Connect(session);
const sessionStore = new ConnectSession({
  conObject: {
    connectionString:
      "postgres://mmnayolh:rhHzkA3y-qJ2VJf3q-JDtUDi1SPK5nhh@peanut.db.elephantsql.com/mmnayolh",
    ssl: process.env.NODE_ENV === "production",
  },
  tableName: "session",
  createTableIfMissing: true,
});

var app = express();

AdminJS.registerAdapter(AdminJSMongoose);

const pageResourceOptions = {
  properties: {
    material: {
      type: "richtext",
      custom: {
        modules: {
          toolbar: [
            ["bold", "italic"],
            ["link", "formula"],
          ],
        },
      },
    },
  },
};

const questionResourceOptions = {
  properties: {
    statement: {
      type: "richtext",
      custom: {
        modules: {
          toolbar: [
            ["bold", "italic"],
            ["link", "formula"],
          ],
        },
      },
    },
  },
};

const importExportFeature = require("@adminjs/import-export").default;

const adminOptions = {
  // We pass Category to `resources`
  resources: [
    {
      resource: Lesson,
      options: pageResourceOptions,
      features: [importExportFeature()],
    },
    { resource: Video },
    { resource: Course },
    { resource: Quiz, features: [importExportFeature()] },
    {
      resource: Question,
      options: questionResourceOptions,
      features: [importExportFeature()],
    },
  ],
};

const admin = new AdminJS(adminOptions);

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate,
    cookieName: "adminjs",
    cookiePassword: "sessionsecret",
  },
  null,
  {
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    secret: "sessionsecret",
    cookie: {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
    },
    name: "adminjs",
  }
);
app.use(admin.options.rootPath, adminRouter);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/courses", courseRouter);
app.use("/progress", progressRouter);

const mongoose = require("mongoose");

const url = "mongodb+srv://test:test@cluster0.rkd2v8q.mongodb.net/aceug";
const connect = mongoose.connect(url);

connect.then(
  (db) => {
    console.log("Connected Successfully to the server");
  },
  (err) => console.log(err)
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
