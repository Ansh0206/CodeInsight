const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  analyze,
  getSubmissions,
  getSubmission,
  clearSubmissions,
} = require("../controllers/analysisController");

router.post("/analyze",          auth, analyze);
router.get("/submissions",       auth, getSubmissions);
router.get("/submissions/:id",   auth, getSubmission);
router.delete("/submissions",    auth, clearSubmissions);

module.exports = router;
