const express = require("express");
const User = require("../models/user");
const router = express.Router();
const passport = require("passport");
const { storeReturnTo } = require("../middleware");
const {
  registerForm,
  register,
  loginForm,
  login,
  logout,
} = require("../controllers/auth");

router.route("/register").get(registerForm).post(register);

router
  .route("/login")
  .get(loginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/auth/login",
    }),
    login,
  );

router.get("/logout", logout);
module.exports = router;
