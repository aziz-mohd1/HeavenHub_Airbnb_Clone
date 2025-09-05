const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

// using MVC architecture (todays date 22 Nov 2024)
const userController = require("../controllers/users.js");

// using router.route (todays date 22 Nov 2024)
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl, // saving the redirect url to locals in ../middleware.js, because passport session deletes it
    passport.authenticate("local", {
      // we dont need to do anything here because passport will handle the authentication
      failureRedirect: "/login", // weather the user is loggedin or not..
      failureFlash: true,
    }),
    userController.login
  );

router.get("/logout", userController.logout);

module.exports = router;
