const express = require("express");
const bodyParser = require("body-parser");
const User = require("../models/users");
const usersRouter = express.Router();
const passport = require("passport");

usersRouter.use(bodyParser.json());

usersRouter
  .route("/")
  .get((req, res, next) => {
    console.log("ok");
  })
  .post((req, res, next) => {
    console.log("aaaa");
    try {
      console.log("heelo");
      User.register(
        {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          class: req.body.class,
          username: req.body.email,
          email: req.body.email,
          phone: req.body.phone
        },
        req.body.password,
        (err, user) => {
          if (err) {
            console.log("rrororrr");
            res.send(err);
          } else {
            console.log("cscscsc");
            passport.authenticate("local")(req, res, function () {
              res.send("Successfully Registered User");
            });
          }
        }
      );
    } catch (error) {
      console.log("this is try error");
      console.log(err);
    }
    
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("Not Supported");
  })
  .delete((req, res, next) => {
    res.statusCode = 403;
    res.end("Not Supported");
  });

  module.exports = usersRouter;