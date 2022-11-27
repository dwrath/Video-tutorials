const express = require("express");
const coursesController = require("../controllers/coursesController");

const router = express.Router();

//Controllers
router.get("/", coursesController.courses_index);
router.post("/create", coursesController.course_create_post);
router.get("/create", coursesController.course_create_get);
router.get("/details/:id/enroll", coursesController.course_enrollment);
router.get("/details/:id/edit", coursesController.course_edit_get);
router.post("/details/:id/edit", coursesController.course_edit_post);
router.get("/details/:id/delete", coursesController.course_delete_get);
router.get("/details/:id", coursesController.course_details);
router.get("/mycourses", coursesController.courses_mycourses);

module.exports = router;
