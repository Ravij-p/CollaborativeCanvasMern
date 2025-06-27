const { spawn } = require("child_process");
const path = require("path");

exports.generateQuestions = (req, res) => {
  const syllabusText = req.body.syllabus || "";
  const process = spawn("python", [
    path.join(__dirname, "../../python-api/que_gen.py"),
  ]);

  let output = "";
  process.stdout.on("data", (data) => {
    output += data.toString();
  });

  process.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });

  process.on("close", (code) => {
    try {
      const result = JSON.parse(output);
      res.json(result);
    } catch {
      res.status(500).json({ error: "Failed to generate questions" });
    }
  });

  process.stdin.write(syllabusText);
  process.stdin.end();
};

exports.scrapeWebsite = (req, res) => {
  const { url } = req.body;
  const process = spawn("python", [
    path.join(__dirname, "../../python-api/scraper.py"),
    url,
  ]);

  let output = "";
  process.stdout.on("data", (data) => (output += data.toString()));
  process.stderr.on("data", (data) => console.error(`Error: ${data}`));
  process.on("close", () => {
    try {
      res.json(JSON.parse(output));
    } catch {
      res.status(500).json({ error: "Scraper failed" });
    }
  });
};

exports.summarizePPT = (req, res) => {
  const filePath = req.file.path;
  const process = spawn("python", [
    path.join(__dirname, "../../python-api/summary_module.py"),
    filePath,
  ]);

  let output = "";
  process.stdout.on("data", (data) => (output += data.toString()));
  process.stderr.on("data", (data) => console.error(`Error: ${data}`));
  process.on("close", () => {
    try {
      res.json(JSON.parse(output));
    } catch {
      res.status(500).json({ error: "Summarization failed" });
    }
  });
};
