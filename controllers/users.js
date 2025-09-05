const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("./users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    // console.log(registeredUser);

    // Automatic Login - built-in passport method, refer passport documentation.
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to HeavenHub!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
  //*** wrapAsync will handle the errors without letting the server crash but it will display the error on some other page.
  //*** thats why we are using try-catch to flash the message within that page if error occurred..!
};

module.exports.renderLoginForm = (req, res) => {
  res.render("./users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to HeavenHub, You are now logged in!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    // .logout() is a built-in passport method.
    if (err) {
      // generally we dont get error while logout, if passport itself fails as a middleware then we handle it here.
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
