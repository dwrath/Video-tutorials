const mongoose = require("mongoose");
const { isAlphanumeric } = require("validator");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

//Define the structure of your data
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter username"],
      unique: true,
      lowercase: true,
      minlength: [5, "Minimum password length is 5 characters"],
      validate: [
        isAlphanumeric,
        "Must consist only of english letters and digits",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: [5, "Minimum password length is 5 characters"],
      validate: [
        isAlphanumeric,
        "Must consist only of english letters and digits",
      ],
    },
    enrolledCourses: [],
  },
  { timestamps: true }
);

// fire a function before doc saved to db
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// static method to login user
userSchema.statics.login = async function (username, password) {
  const user = await this.findOne({ username });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect username");
};

//Model creates a user interface with static & instance methods
const User = mongoose.model("User", userSchema);

module.exports = User;
