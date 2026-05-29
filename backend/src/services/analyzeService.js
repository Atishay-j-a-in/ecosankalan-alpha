const { performance } = require("perf_hooks");
const client = require("./openaiClient");
const { wasteSchema } = require("../config/schema");
const { buildInput } = require("../utils/buildInput");

const extractOutputText = (response) => {
  return response.output
    .flatMap((item) => item.content || [])
    .find((content) => content.type === "output_text")?.text;
};

const runModel = async (modelName, files, basePrompt, modelPrompts) => {
  const started = performance.now();

  try {
    const response = await client.responses.create({
      model: modelName,
      input: buildInput(files, modelName, basePrompt, modelPrompts),
      text: {
        format: {
          type: "json_schema",
          name: "waste_detection",
          strict: true,
          schema: wasteSchema,
        },
      },
    });

    const parsedText = extractOutputText(response);

    if (!parsedText) {
      throw new Error("No output text found");
    }

    const parsed = JSON.parse(parsedText);

    return {
      success: true,
      model: modelName,
      latencyMs: Math.round(performance.now() - started),
      usage: {
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
        totalTokens: response.usage?.total_tokens,
      },
      parsed,
      rawText: parsedText,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      model: modelName,
      latencyMs: Math.round(performance.now() - started),
      usage: null,
      parsed: null,
      rawText: null,
      error: {
        message: error.message,
      },
    };
  }
};

const runAllModels = async (models, files, basePrompt, modelPrompts) => {
  const settled = await Promise.allSettled(
    models.map((modelName) =>
      runModel(modelName, files, basePrompt, modelPrompts)
    )
  );

  return settled.map((item) =>
    item.status === "fulfilled"
      ? item.value
      : {
          success: false,
          error: item.reason,
        }
  );
};

module.exports = {
  runAllModels,
};
