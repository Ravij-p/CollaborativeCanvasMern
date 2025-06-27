const { execFile } = require("child_process");

execFile("python", ["--version"], (err, stdout, stderr) => {
  if (err) return console.error("Error:", err);
  console.log("Python Version:", stdout || stderr);
});
