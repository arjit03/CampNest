const User = require("../models/user");
module.exports.registerForm = (req, res) => {
  res.render("auth/register");
};
module.exports.register = async (req, res, next) => {
  try {
    const { password, username, email } = req.body.user;
    const user = new User({
      username,
      email,
    });
    const registeredUser = await User.register(user, password); // resolves to the stored user document
    req.logIn(registeredUser, (err) => {
      // req.login is a passport method, used to login a user,
      // typing used after signin up a user, to log them in instantly,
      // takes the user document to be logged in, and an callback to handle errors/success
      if (err) return next(err);
      req.flash("success", "Welcome to campgrounds!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    if (e.code === 11000) {
      req.flash("error", "Email already exists!");
      return res.redirect("/auth/register");
    }
    req.flash("error", e.message);
    return res.redirect("/auth/register");
  }
};

module.exports.loginForm = (req, res) => {
  res.render("auth/login");
};
module.exports.login = (req, res) => {
  const redirectTo = res.locals.returnTo || "/campgrounds";
  req.flash("success", "Logged In");
  res.redirect(redirectTo);
};

module.exports.logout = (req, res) => {
  req.logOut((err) => {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/campground");
    }
    // if no error then :-
    req.flash("success", "Logged Out Successfully");
    res.redirect("/campgrounds");
  });
  // passport method which is attached to req object upon initizalizing passport.
  // Passport method that logs out the user by removing user data from the session.
  // takes a callback function that handles any potential errors, and reirect the user.
};
