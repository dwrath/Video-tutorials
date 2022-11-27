const Course = require("../models/Course");
const User = require("../models/User");

const handleErrors = (err) => {
  let errors = { title: "", description: "", imageUrl: "" };

  // duplicate title error
  if (err.code === 11000) {
    errors.title = "Title is already registered";
    return errors;
  }

  //Title Validation
  if (err.errors.title == "Please enter a title") {
    errors.title = "Please enter a title";
  }

  if (err.errors.title == "Minimum title length is 4 characters") {
    errors.title = "Minimum title length is 4 characters";
  }

  //Description Validation
  if (err.errors.description == "Please enter a description") {
    errors.description = "Please enter a description";
  }

  if (err.errors.description == "Minimum description length is 20 characters") {
    errors.description = "Minimum description length is 20 characters";
  }

  //Image Url Validation
  if (err.errors.imageUrl == "Please enter an image url") {
    errors.imageUrl = "Please enter an image url";
  }
  if (err.errors.imageUrl == "Url must be http or https") {
    errors.imageUrl = "Url must be http or https";
  }

  return errors;
};

const courses_index = (req, res) => {
  const userId = res.locals.user._id;


  if(req.query.search){

    Course.find({}).then((courses) => {
    const coursesCopy = [...courses];
      //search mode
      if (req.query.search) {
        courses = courses.filter((course) =>
          course.title.toLowerCase().includes(req.query.search.toLowerCase())
        );

        if (courses.length == 0) {
          courses = coursesCopy;
        }
      }

      res.render("home_pages/home", {
        title: "All Courses",
        courses,
        userId,
        myCourses: false,
        msg: false,
      });
    });

  }else{
  // Home

  Course.find()
    .sort({ enrolledUsers: -1, createdAt: -1 })
    .then((result) => {

    //Only display the public courses
    result = result.filter((course) => course.isPublic);

      res.render("home_pages/home", {
        title: "All Courses",
        courses: result,
        userId,
        msg: false,
        myCourses: false,
      });
    })
    .catch((err) => {
      console.error(err.message);
    });
}
 
};

const courses_search = (req, res) => {
  //Capture user id
  const userId = res.locals.user._id;

  Course.find({}).then((courses) => {
    //copy the courses
    const coursesCopy = [...courses];

    //search mode
    if (req.query.search) {
      courses = courses.filter((course) =>
        course.title.toLowerCase().includes(req.query.search.toLowerCase())
      );

      if (courses.length == 0) {
        courses = coursesCopy;
      }
    }

    res.render("home_pages/home", {
      title: "All Courses",
      courses,
      userId,
      myCourses: false,
      msg: false,
    });
  });
};

const courses_mycourses = (req, res) => {
  //Capture user id
  let msg = false;  

  const userId = res.locals.user._id;
  Course.find({}).then((courses) => {
    //copy the courses
    const coursesCopy = [...courses];

    //search mode

    courses = courses.filter((course) => course.enrolledUsers.includes(userId) || course.author == userId);
    if (courses.length == 0) {
      courses = [];
      msg = "You have not enrolled in any courses.";
    }

    res.render("home_pages/home", {
      title: "My Courses",
      courses,
      userId,
      msg,
      myCourses: true,
    });
  });
};

const course_enrollment = async (req, res) => {
  const userId = res.locals.user._id;
  const courseId = req.params.id;

  try {
    let course = await Course.findById({ _id: courseId });

    if (course.enrolledUsers.includes(userId)) {
      await Course.updateOne(
        { _id: courseId },
        { $pull: { enrolledUsers: userId } }
      );
      await User.updateOne(
        { _id: userId },
        { $pull: { enrolledCourses: courseId } }
      );
    } else {
      await Course.updateOne(
        { _id: courseId },
        { $push: { enrolledUsers: userId } }
      );
      await User.updateOne(
        { _id: userId },
        { $push: { enrolledCourses: courseId } }
      );
    }

    res.redirect("back");
  } catch (err) {
    console.error(err.message);
  }
};

const course_details = (req, res) => {

  const id = req.params.id;

  Course.findById(id)
    .then((result) => {
      
      const currentUserCourses = res.locals.user.enrolledCourses;
      let isEnrolled = currentUserCourses.includes(result._id);
      //Check is the current user is the author
      let isAuthor;
      result.author == res.locals.user._id
        ? (isAuthor = true)
        : (isAuthor = false);

      res.render("courses/course-details", {
        course: result,
        title: "Course Details",
        isEnrolled,
        isAuthor,
      });
    })

    .catch((err) => {
      res.status(404).render("404", { title: "Course details not found" });
    });
};

const course_create_get = (req, res) => {
  const userId = res.locals.user._id;
  res.render("courses/create-course", {
    title: "Create a new Course",
    userId,
  });
};

const course_create_post = async (req, res) => {
  try {
    await Course.create(req.body);
    res.json({ status: "success" });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
    console.log(err);
  }
};

const course_edit_get = (req, res) => {
  const courseId = req.params.id;
  Course.findById(courseId).then((result) => {
    //Modify url value when not provided
    if (result.imageUrl === "/imgs/no-image.jpg") {
      result.imageUrl = "";
    }
    res.render("courses/edit-course", {
      course: result,
      title: "Edit Course",
    });
  });
};

const course_edit_post = async (req, res) => {

  try {
    const id = req.body.courseId;
    const { title, description, imageUrl, isPublic } = req.body;
    await Course.findByIdAndUpdate(
      { _id: id },
      { title, description, imageUrl, isPublic },
      { new: true, runValidators: true }
    );
    res.json({ status: "success" });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
    console.log(err);
  }
};

const course_delete_get = (req, res) => {
  const id = req.params.id;
  Course.findByIdAndDelete(id)
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.error(err.message));
};

module.exports = {
  courses_index,
  course_details,
  course_create_get,
  course_create_post,
  course_enrollment,
  course_edit_get,
  course_edit_post,
  courses_search,
  course_delete_get,
  courses_mycourses,
};
