const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const { uploadPDF } = require("../controllers/roomController");

router.post("/upload-pdf", upload.single("file"), uploadPDF);

const {
  generateQuestions,
  summarizePPT,
  scrapeWebsite,
} = require("../controllers/apiController");

router.post(
  "/questions",
  upload.fields([{ name: "syllabus" }, { name: "pyqs" }]),
  generateQuestions
);
router.post("/summarize", upload.single("file"), summarizePPT);
router.post("/scrape", scrapeWebsite);

module.exports = router;
