const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Course = require("../models/Course");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, "thisismysecret", (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        next();
      }
    });
  } else {
    //Render the Guest Page
    Course.find()
      .sort({ enrolledUsers: -1 })
      .then((courses) => {
        //copy the courses
        const coursesCopy = [...courses];
        let publicCourses = coursesCopy.filter((course) => course.isPublic);

        if (coursesCopy.length > 3) {
          publicCourses = publicCourses.slice(0, 3);
        }

        res.render("home_pages/guest", {
          title: "Top Courses",
          courses: publicCourses,
        });
      })
      .catch((err) => {
        console.error(err.message);
      });
  }
};

// check if current user has access to current layout
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "thisismysecret", async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, checkUser };
