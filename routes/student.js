const express = require("express"),
    router = express.Router(),
    request = require("request"),
    middleware = require("../middleware"),
    Student = require("../models/student"),
    File = require("../models/file"),
    passport = require("passport"),
    path = require("path");
env = require("dotenv");
const { spawnSync } = require("child_process");
env.config();
const JOURNAL_API = process.env.JOURNAL_API;
const BOOK_API = process.env.BOOK_API;

//==========================================================================
//create a new student
router.post("/", (req, res) => {
    var newUser = new Student({ username: req.body.username, role: "Student" });
    Student.register(newUser, req.body.password, function (error, user) {
        if (error) {
            console.log(error.message);
            return res.redirect("/signup");
        }
        passport.authenticate("student")(req, res, function () {
            res.redirect("/");
        });
    });
});

//==========================================================================

//show login form
router.get("/login", (req, res) => {
    res.render("/login");
});

//==========================================================================
//handle login logic

router.post(
    "/login",
    passport.authenticate("student", {
        successRedirect: "/student",
        failureRedirect: "/student/login",
    }),
    function (req, res) {},
);

//==========================================================================
//logout route

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

//==========================================================================
//show resource page
router.get("/", middleware.isStudent, async (req, res) => {
    const files = await File.find({});

    res.render("files", { data: files });
});
const doRequest = (url) => {
    return new Promise(function (resolve, reject) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode === 200) {
                resolve(JSON.parse(body));
            } else {
                console.log(JSON.parse(body));
                resolve(undefined);
            }
        });
    });
};
router.get(/\/(.*)/, middleware.isStudent, async (req, res) => {
    let keywords;
    //==========================================================================
    //running python script
    console.log(req.params[0]);
    const topic = req.query.topic;
    console.log("topic", topic);
    const path = req.params[0] === "" ? "vec.pptx" : `./data/files/${req.params[0]}`;
    const pythonProcess = await spawnSync("python3", ["./app.py", path]);
    const data = pythonProcess.stdout?.toString()?.trim();
    const error = pythonProcess.stderr?.toString()?.trim();
    // console.log(result);
    // console.log(error);

    // var spawn = require("child_process").spawn;
    // var process = spawn(
    //     "python3",
    //     ["app.py", path],
    //     // { shell: true },
    //     // ["-c", `import app; app.func(${path})`],
    // );
    // process.stdout.on("data", (data) => {
    let query = topic.split(",").join("+");
    keywords = data.toString();
    keywords = keywords.substring(1, keywords.length);
    keywords = keywords.split(",");
    console.log(keywords);
    x = keywords[1];
    for (var i = 2; i < 4; i++) {
        x += "+" + keywords[i];
    }
    query = x;
    if (keywords.length <= 1) query = topic.split(",").join("+");
    // let query = req.query.topic;
    // console.log(query);
    var parj = "citedby-count",
        pary = "relevance",
        parb = "relevance",
        parg = "stars";
    if (req.query.journal != undefined) parj = req.query.jounal;
    if (req.query.video != undefined) pary = req.query.video;
    if (req.query.book != undefined) parb = req.query.book;
    if (req.query.project != undefined) parg = req.query.project;
    const parameters = { parj, pary, parb, parg };
    if (query == null) query = "computer science";
    try {
        let urlj = `https://api.elsevier.com/content/search/scopus?query=${query}&sort=${parj}&count=4&apikey=${JOURNAL_API}&format=json`;
        let urly = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&order=${pary}&type=video&maxResults=4&key=${BOOK_API}`;
        var urlb = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=4&orderBy=${parb}&key=${BOOK_API}`;
        var urlg = `https://api.github.com/search/repositories?q=${query}&sort=${parg}&order=desc&per_page=4`;
        const dj = await doRequest(urlj);
        const dy = await doRequest(urly);
        const db = await doRequest(urlb);
        const dg = await doRequest({
            url: urlg,
            headers: {
                "User-Agent": "request",
            },
        });
        res.render("resources", {
            data: dj,
            data2: dy,
            data3: db,
            data4: dg,
            query: query,
            parameters,
        });
    } catch (err) {
        console.log(err);
    }
    // request(url, (err, response, body) => {
    //     if (!err && response.statusCode === 200) {
    //         var data = JSON.parse(body);
    //         let url2 = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&order=${pary}&type=video&maxResults=4&key=${BOOK_API}`;
    //         request(url2, (error, resp, bd) => {
    //             if (!error && resp.statusCode === 200) {
    //                 var data2 = JSON.parse(bd);
    //                 var urlb = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=4&orderBy=${parb}&key=${BOOK_API}`;

    //                 request(urlb, (errb, respb, bb) => {
    //                     if (!errb && respb.statusCode == 200) {
    //                         var db = JSON.parse(bb);
    //                         var urlg = `https://api.github.com/search/repositories?q=${query}&sort=${parg}&order=desc&per_page=4`;
    //                         if (parg == "default") urlg = `https://api.github.com/search/repositories?q=${query}&per_page=4`;
    //                         var options = {
    //                             url: urlg,
    //                             headers: {
    //                                 "User-Agent": "request",
    //                             },
    //                         };
    //                         console.log(url);
    //                         console.log(url2);
    //                         console.log(urlg);
    //                         console.log(urlb);
    //                         request(options, (errg, respg, bg) => {
    //                             if (!errg && respg.statusCode == 200) {
    //                                 var dg = JSON.parse(bg);
    //                                 res.render("resources", {
    //                                     data: data,
    //                                     data2: data2,
    //                                     data3: db,
    //                                     data4: dg,
    //                                     query: query,
    //                                     parameters,
    //                                 });
    //                             } else {
    //                                 console.log(respg.statusCode);
    //                                 res.render("resources", {
    //                                     data: data,
    //                                     data2: data2,
    //                                     data3: db,
    //                                     data4: undefined,
    //                                     query: query,
    //                                     parameters,
    //                                 });
    //                             }
    //                         });
    //                     } else {
    //                         console.log(errb + " " + response + "book");
    //                         res.render("resources", {
    //                             data: data,
    //                             data2: data2,
    //                             data3: undefined,
    //                             data4: undefined,
    //                             query: query,
    //                             parameters,
    //                         });
    //                     }
    //                 });
    //             } else {
    //                 console.log(error + " " + response + "youtube");
    //                 res.render("resources", {
    //                     data: data,
    //                     data2: undefined,
    //                     data3: undefined,
    //                     data4: undefined,
    //                     query: query,
    //                     parameters,
    //                 });
    //             }
    //         });
    //     } else {
    //         console.log(err + " " + response + "scopus");
    //         res.render("resources", {
    //             data: undefined,
    //             data2: undefined,
    //             data3: undefined,
    //             data4: undefined,
    //             query: query,
    //             parameters,
    //         });
    //     }
    // });
});

// process.stderr.on("data", (data) => console.log("error"));
// });

//==========================================================================
module.exports = router;
