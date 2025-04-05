const { exec } = require("child_process");

// Specify the Python script and any arguments
const pythonScriptPath = "app.py";
const args = ["vec.pptx"];

// Construct the command
const command = `python3 ${pythonScriptPath} ${args.join(" ")}`;

// Execute the command
var spawn = require("child_process").spawn;
var process = spawn(
    "python3",
    ["app.py", "./vec.pptx"],
    // { shell: true, detached: true },
    // ["-c", `import app; app.func(${path})`],
);
process.stdout.on("data", (data) => console.log(data.toString()));
process.stderr.on("data", (data) => console.log(data.toString()));
// exec(command, (error, stdout, stderr) => {
//     if (error) {
//         console.error(`Error executing Python script: ${error}`);
//         return;
//     }

//     console.log(`Python Script Output: ${stdout}`);
//     console.error(`Python Script Error: ${stderr}`);
// });
