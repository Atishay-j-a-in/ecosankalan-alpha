const express = require("express");
const { upload } = require("../middleware/upload");
const { asyncHandler } = require("../middleware/asyncHandler");
const { createHttpError } = require("../utils/httpError");
const { MODEL_LIST } = require("../config/models");
const { BASE_PROMPT, MODEL_PROMPTS } = require("../config/prompts");
const { MAX_FILES } = require("../config/env");
const { runAllModels } = require("../services/analyzeService");

const router = express.Router();

router.post(
  "/analyze",
  upload.array("images", MAX_FILES),
  asyncHandler(async (req, res) => {
    const files = req.files;

    if (!files?.length) {
      throw createHttpError(400, "No images uploaded");
    }

    const results = await runAllModels(
      MODEL_LIST,
      files,
      BASE_PROMPT,
      MODEL_PROMPTS
    );

    res.json({
      success: true,
      totalModels: MODEL_LIST.length,
      results,
    });
  })
);

module.exports = router;
