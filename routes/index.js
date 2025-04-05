const Student = require("../models/student");
const Attendance = require("../models/attendance");
const mongoose = require("mongoose");
const express = require("express"),
    router = express.Router(),
    middleware = require("../middleware");

//show homepage
router.get("/", (req, res) => res.render("home"));
router.get("/home", (req, res) => res.redirect("/"));

//show signup page
router.get("/signup", function (req, res) {
    res.render("signup");
});

//show login page
router.get("/login", (req, res) => res.render("login"));

//show about page
router.get("/about", (req, res) => res.render("about"));
router.get("/posted", (req, res) => res.render("posted"));

//show upload page
router.get("/upload", middleware.isFaculty, (req, res) => res.render("upload"));
router.get("/attendance", middleware.isFaculty, async (req, res) => {
    const students = await Student.find({});

    const dates = await Attendance.find({}).select("date").lean();
    const record = await Attendance.find({ date: new Date().toDateString() });
    console.log("record", record);
    // presentStudents = record[0]?.students?.map(async (id) => );
    console.log(students.map((st) => st._id));
    console.log("___________");
    presentStudents = students.filter((st) => record[0]?.students?.includes(st._id));
    presentStudents = presentStudents.map((st) => st._id);
    res.render("attendance", { students, date: record.date ?? new Date().toDateString(), presentStudents, dates });
});
module.exports = router;
