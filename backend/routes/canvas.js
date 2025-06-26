const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { saveCanvas, loadCanvas } = require("../controllers/canvasController");
router.post("/save", auth, saveCanvas);
router.get("/:roomId/load", auth, loadCanvas);
module.exports = router;
