const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  generateQuestions,
  summarizePPT,
  scrapeWebsite,
} = require("../controllers/apiController");
const { uploadPDF } = require("../controllers/apiController");

router.post("/upload-pdf", upload.single("file"), uploadPDF);
router.post(
  "/questions",
  upload.fields([{ name: "syllabus" }, { name: "pyqs" }]),
  generateQuestions
);
router.post("/summarize", upload.single("file"), summarizePPT);
router.post("/scrape", scrapeWebsite);

module.exports = router;
