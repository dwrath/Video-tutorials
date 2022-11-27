const User = require("../models/User");
const jwt = require("jsonwebtoken");

// create json web token
const maxAge = 14400000; // 4hrs
const createToken = (id) => {
  return jwt.sign({ id }, "thisismysecret", {
    expiresIn: maxAge,
  });
};

// handle errors
const handleLoginErrors = (err) => {
  let errors = { username: "", password: "" };

  // incorrect username
  if (err.message === "incorrect username") {
    errors.username = "Username is not registered";
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "Password is incorrect";
  }

  return errors;
};

const handleSignupErrors = (err, password, repeatPassword) => {
  let errors = { username: "", password: "" };

  // duplicate username error
  if (err.code === 11000) {
    errors.username = "Username is already registered";
    return errors;
  }

  if (err.errors.username == "Please enter username") {
    errors.username = "Please enter username";
  }

  if (
    err.errors.username == "Must consist only of english letters and digits"
  ) {
    errors.username = "Must consist only of english letters and digits";
  }

  if (err.errors.username == "Minimum password length is 5 characters") {
    errors.username = "Minimum password length is 5 characters";
  }

  //Password Validation
  if (err.errors.password == "Path `password` is required.") {
    errors.password = "Please enter a password";
  }

  if (
    err.errors.password == "Must consist only of english letters and digits"
  ) {
    errors.password = "Must consist only of english letters and digits";
  }

  if (err.errors.password == "Minimum password length is 5 characters") {
    errors.password = "Minimum password length is 5 characters";
  }

  return errors;
};

// controller actions
module.exports.guest_get = (req, res) => {
  res.render("guest", { title: "Guest" });
};

module.exports.signup_get = (req, res) => {
  res.render("user_pages/signup", { title: "Register" });
};

module.exports.login_get = (req, res) => {
  res.render("user_pages/login", { title: "login" });
};

module.exports.signup_post = async (req, res) => {
  const { username, password, repeatPassword } = req.body;
  try {
    const user = await User.create({ username, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleSignupErrors(err, password, repeatPassword);
    res.status(400).json({ errors });
    console.log(err);
  }
};

module.exports.login_post = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.login(username, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleLoginErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
