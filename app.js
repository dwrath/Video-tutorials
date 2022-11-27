//Dependancies
const express = require("express");
const { engine } = require("express-handlebars");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const PORT = process.env.PORT || 4000;

//Remote files
const coursesRoutes = require("./routes/coursesRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middleware/authMiddleware");

//express app
const app = express();

//Connect to MongoDB
dotenv.config({ path: "./config/config.env" });
const dbURI = process.env.MONGO_URL;

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT);
    console.log(`Connected to DB & listening on port ${PORT}`);
  })
  .catch((err) => console.error(err.message));
//setup Template
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    partialsDir: path.join(__dirname, "views", "partials"),
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
//Register view Engine
app.set("view engine", "hbs");

//Static files
app.use(express.static("public"));

//Middleware
app.use(express.json()); //Applies form data to the req.body
app.use(cookieParser());
app.use(morgan("dev")); //displays error messages in the console with options.

app.get("*", checkUser);
app.use("/courses", requireAuth, coursesRoutes);

app.get("/", (req, res) => {
  res.redirect("/courses");
});

app.use(authRoutes);

app.use("*", (req, res) => {
  res.render("404", { title: "404", modifiedFooter: true });
});
