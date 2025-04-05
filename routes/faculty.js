const express = require("express"),
    router = express.Router(),
    Faculty = require("../models/faculty"),
    passport = require("passport");
const middleware = require("../middleware/index");
const attendance = require("../models/attendance");
const Attendance = require("../models/attendance");
const Student = require("../models/student");
const mongoose = require("mongoose");

//create faculty
router.post("/", function (req, res) {
    var newUser = new Faculty({ username: req.body.username, role: "Faculty" });
    Faculty.register(newUser, req.body.password, function (error, user) {
        if (error) {
            console.log(error.message);
            req.flash("error", error.message);
            return res.redirect("/signup");
        }
        passport.authenticate("faculty")(req, res, function () {
            req.flash("success", "Welcome " + user.username);
            res.redirect("/");
        });
    });
});

//handle login logic
router.post(
    "/login",
    passport.authenticate("faculty", {
        successRedirect: "/upload",
        failureRedirect: "/login",
    }),
    function (req, res) {},
);

router.post("/attendance", middleware.isFaculty, async (req, res) => {
    let ids = Object.keys(req.body);
    // let students = [];
    let attendance;
    let record = await Attendance.find({ date: new Date().toDateString() });
    console.log(record);
    if (!record.length) attendance = new Attendance({ date: new Date().toDateString() });
    else attendance = record[0];
    // console.log((await Student.findByUsername(ids[0]))._id);
    // arr = [];
    // ids.forEach(async (id) => {
    //     console.log((await Student.findByUsername(id))._id);
    // });
    // console.log(arr);
    attendance.students = ids;
    // ids.forEach((id) => attendance.students.push(id));
    // console.log(students);
    // mongoose.Types.ObjectId;
    // attendance.students.push (students);
    console.log(attendance);
    attendance.save();
    res.redirect("/posted");
});
//handle logout logic
router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Logged You OUT !");
    res.redirect("back");
});

module.exports = router;
