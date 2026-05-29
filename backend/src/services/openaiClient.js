const OpenAI = require("openai");
const { OPENAI_API_KEY } = require("../config/env");

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

module.exports = client;
