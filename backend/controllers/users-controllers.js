const { v7: uuid } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  console.log("========== GET USERS START ==========");
  console.log("1. Fetching all users from database");
  
  let users;
  try {
    users = await User.find({}, "-password");
    console.log("2. Users fetched successfully");
    console.log("3. Number of users found:", users.length);
    if (users.length > 0) {
      console.log("4. Sample user data:", users[0].toObject());
      console.log("5. User schema fields present:", Object.keys(users[0].toObject()));
    }
  } catch (err) {
    console.error("ERROR fetching users:", err);
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  
  console.log("6. Sending users response");
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
  console.log("========== GET USERS END ==========");
};

const signup = async (req, res, next) => {
  console.log("========== SIGNUP START ==========");
  console.log("1. Signup request received");
  console.log("2. Request body:", req.body);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("3. Validation errors found:", errors.array());
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  
  console.log("3. Validation passed");
  const { firstName, lastName, mobileNumber, email, password } = req.body;
  console.log("4. Extracted fields:", { firstName, lastName, mobileNumber, email, password: "***" });

  let existingUser;
  try {
    console.log("5. Checking if user already exists with email:", email);
    existingUser = await User.findOne({ email: email });
    console.log("6. Existing user check result:", existingUser ? "User found" : "No user found");
  } catch (err) {
    console.error("ERROR checking existing user:", err);
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    console.log("7. User already exists - aborting signup");
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  console.log("7. Creating new user with schema fields...");
  const createdUser = new User({
    firstName,
    lastName,
    mobileNumber,
    email,
    password,
  });
  console.log("8. User object created:", createdUser.toObject());

  try {
    console.log("9. Attempting to save user to database...");
    await createdUser.save();
    console.log("10. User saved successfully with ID:", createdUser.id);
  } catch (err) {
    console.error("--- SIGNUP FAILED ---", err);
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    if (err.errors) {
      console.error("Validation errors:", err.errors);
    }

    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  console.log("11. Sending success response");
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  console.log("========== SIGNUP END ==========");
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  console.log("Login attempt for email:", email);
  console.log("Request body received:", req.body);

  let existingUser;

  try {
    existingUser = await User.findOne({ email: req.body.email });
    console.log("User query result:", existingUser);
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  res.json({
    message: "Logged in!",
    userId: existingUser.id,
    email: existingUser.email,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
