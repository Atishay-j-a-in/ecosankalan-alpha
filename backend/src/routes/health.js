const express = require("express");
const { MODELS } = require("../config/models");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    models: Object.keys(MODELS),
  });
});

module.exports = router;
