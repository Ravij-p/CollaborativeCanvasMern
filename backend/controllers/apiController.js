const { spawn } = require("child_process");

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { execFile } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const python_path = "python";
const downloadFile = async (url, destPath) => {
  const writer = fs.createWriteStream(destPath);
  const response = await axios.get(url, { responseType: "stream" });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

exports.generateQuestions = async (req, res) => {
  try {
    const syllabusUrl = req.files["syllabus"]?.[0]?.path;
    const pyqsUrl = req.files["pyqs"]?.[0]?.path;

    if (!syllabusUrl || !pyqsUrl) {
      return res.status(400).json({ message: "Missing file uploads" });
    }

    const tmpDir = path.join(__dirname, "..", "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const syllabusPath = path.join(tmpDir, `syllabus-${uuidv4()}.pdf`);
    const pyqsPath = path.join(tmpDir, `pyqs-${uuidv4()}.pdf`);

    await downloadFile(syllabusUrl, syllabusPath);
    await downloadFile(pyqsUrl, pyqsPath);

    const scriptPath = path.join(
      __dirname,
      "..",
      "..",
      "python-api",
      "que_gen.py"
    );

    execFile(
      python_path,
      [scriptPath, syllabusPath, pyqsPath],
      (error, stdout, stderr) => {
        fs.unlinkSync(syllabusPath);
        fs.unlinkSync(pyqsPath);

        if (error) {
          console.error("Python Error:", stderr);
          return res
            .status(500)
            .json({ error: "Failed to generate questions" });
        }

        res.json({ questions: stdout.trim() });
      }
    );
  } catch (err) {
    console.error("Generate Question Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.summarizePPT = (req, res) => {
  const fileUrl = req.file?.path;
  if (!fileUrl) return res.status(400).json({ message: "No file uploaded" });

  const tmpDir = path.join(__dirname, "..", "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const localPath = path.join(tmpDir, `ppt-${uuidv4()}.pptx`);

  downloadFile(fileUrl, localPath)
    .then(() => {
      const scriptPath = path.join(
        __dirname,
        "..",
        "python-api",
        "summary_module.py"
      );

      execFile("python", [scriptPath, localPath], (error, stdout, stderr) => {
        fs.unlinkSync(localPath); // Clean up temp file

        if (error) {
          console.error("Summary error:", stderr);
          return res.status(500).json({ error: "Summarization failed" });
        }

        try {
          const parsed = JSON.parse(stdout);
          return res.json({ summary: parsed });
        } catch (err) {
          console.error("JSON parse error:", err);
          return res.status(500).json({ error: "Invalid summary format" });
        }
      });
    })
    .catch((err) => {
      console.error("Download error:", err);
      res.status(500).json({ message: "Failed to download file" });
    });
};

// backend/controllers/apiController.js
exports.scrapeWebsite = (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "Missing URL" });

  const scriptPath = path.join(
    __dirname,
    "..",
    "..",
    "python-api",
    "scraper.py"
  );
  console.log("Using scraper.py at:", scriptPath); // ✅ log this

  execFile("python", [scriptPath, url], (error, stdout, stderr) => {
    if (error) {
      console.error("Scraper Error:", stderr);
      return res.status(500).json({ error: "Web scraping failed" });
    }

    res.json({ content: stdout.trim() });
  });
};

exports.uploadPDF = (req, res) => {
  const pdf = req.file;
  if (!pdf) return res.status(400).json({ error: "No file uploaded" });

  res.status(200).json({
    url: pdf.path, // Cloudinary secure URL
  });
};
