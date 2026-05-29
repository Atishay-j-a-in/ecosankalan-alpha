require("dotenv").config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const PORT = toNumber(process.env.PORT, 5000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const JSON_LIMIT = process.env.JSON_LIMIT || "50mb";
const MAX_FILE_SIZE = toNumber(
  process.env.MAX_FILE_SIZE,
  10 * 1024 * 1024
);
const MAX_FILES = toNumber(process.env.MAX_FILES, 10);

module.exports = {
  PORT,
  OPENAI_API_KEY,
  JSON_LIMIT,
  MAX_FILE_SIZE,
  MAX_FILES,
};
