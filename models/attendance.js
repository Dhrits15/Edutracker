const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const AttendanceSchema = new mongoose.Schema({
    date: String,
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
        },
    ],
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
