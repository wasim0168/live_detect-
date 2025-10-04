const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const response = await axios.post("http://127.0.0.1:5000/detect", req.body, {
      timeout: 5000   // avoid hanging forever
    });
    res.json(response.data);
  } catch (err) {
    console.error("Detection API error:", err.message);
    res.status(500).json({ error: "Detection service unavailable" });
  }
});

module.exports = router;
