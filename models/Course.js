const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isURL } = require("validator");

//Define the structure of your data
const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a title"],
      unique: true,
      minlength: [4, "Minimum title length is 4 characters"],
    },
    description: {
      type: String,
      minlength: [20, "Minimum description length is 20 characters"],
      required: [true, "Please enter a description"],
    },
    imageUrl: {
      type: String,
      required: [true, "Please enter an image url"],
      validate: [isURL, "Url must be http or https"],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: String,
    },
    author: {
      type: String,
    },

    enrolledUsers: [String],
  },
  { timestamps: true }
);

//Model creates a user interface with static & instance methods
const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
