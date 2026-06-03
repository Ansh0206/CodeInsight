const express = require("express");
const router = express.Router();
const {
  analyze,
  getSubmissions,
  getSubmission,
  clearSubmissions,
} = require("../controllers/analysisController");

router.post("/analyze", analyze);
router.get("/submissions", getSubmissions);
router.get("/submissions/:id", getSubmission);
router.delete("/submissions", clearSubmissions);

module.exports = router;
