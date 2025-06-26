const axios = require("axios");

exports.generateQuestions = async (req, res) => {
  const formData = new FormData();
  formData.append(
    "syllabus",
    req.files.syllabus[0].buffer,
    req.files.syllabus[0].originalname
  );
  req.files.pyqs.forEach((file) =>
    formData.append("pyqs", file.buffer, file.originalname)
  );

  const response = await axios.post(
    "http://localhost:8000/generate-questions",
    formData,
    {
      headers: formData.getHeaders(),
    }
  );

  res.json(response.data);
};

exports.summarizePPT = async (req, res) => {
  const formData = new FormData();
  formData.append("file", req.file.buffer, req.file.originalname);

  const response = await axios.post(
    "http://localhost:8000/summarize-ppt",
    formData,
    {
      headers: formData.getHeaders(),
    }
  );

  res.json(response.data);
};

exports.scrapeWebsite = async (req, res) => {
  const response = await axios.post(
    "http://localhost:8000/scrape-link",
    req.body
  );
  res.json(response.data);
};
