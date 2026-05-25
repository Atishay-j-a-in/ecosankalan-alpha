const express = require("express");
require("dotenv").config();

const cors = require("cors");
const multer = require("multer");

const OpenAI = require("openai");

const app = express();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 5000;

/* ------------------------------------------------ */
/* MIDDLEWARE */
/* ------------------------------------------------ */

app.use(cors());

app.use(
  express.json({
    limit: "50mb",
  })
);

/* ------------------------------------------------ */
/* MULTER */
/* ------------------------------------------------ */

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/* ------------------------------------------------ */
/* MODELS */
/* ------------------------------------------------ */

const MODELS = {
  gpt54: "gpt-5.4",
  gpt5: "gpt-5",
  gpt5mini: "gpt-5-mini",
  gpt41: "gpt-4.1",
  gpt41mini: "gpt-4.1-mini",
  gpt4o: "gpt-4o",
  gpt4omini: "gpt-4o-mini",
};

/* ------------------------------------------------ */
/* BASE PROMPT */
/* ------------------------------------------------ */

const BASE_PROMPT = `
You are a professional waste segregation assistant.

Your job:
- identify waste items
- identify materials
- determine waste category
- suggest environmentally safer alternatives
- suggest reuse ideas
- explain disposal preparation

Keep responses:
- practical
- short
- realistic
- household-friendly

Never invent municipal laws.
Never generate long essays.
`;

/* ------------------------------------------------ */
/* MODEL PROMPTS */
/* ------------------------------------------------ */

const MODEL_PROMPTS = {
  "gpt-5.4": `
Be concise and highly accurate.
Use practical environmental guidance.
`,

  "gpt-5": `
Provide balanced environmental guidance.
Avoid speculative claims.
`,

  "gpt-5-mini": `
Use short factual outputs.

Only suggest:
- realistic reuse ideas
- affordable alternatives
- common household solutions
`,

  "gpt-4.1": `
Be structured and concise.
Avoid unnecessary explanations.
`,

  "gpt-4.1-mini": `
Rules:
- keep outputs short
- avoid long paragraphs
- do not invent recycling policies
`,

  "gpt-4o": `
Focus on image understanding accuracy.
Use concise environmental guidance.
`,

  "gpt-4o-mini": `
Rules:
- short responses only
- max 3 reuse ideas
- max 5 disposal steps

Allowed hazard levels:
LOW
MEDIUM
HIGH
`,
};

/* ------------------------------------------------ */
/* JSON SCHEMA */
/* ------------------------------------------------ */

const wasteSchema = {
  type: "object",

  properties: {
    reports: {
      type: "array",

      items: {
        type: "object",

        properties: {
          imageIndex: {
            type: "number",
          },

          identifiedObject: {
            type: "string",
          },

          material: {
            type: "string",
          },

          wasteCategory: {
            type: "string",

            enum: [
              "Recyclable",
              "Organic",
              "Hazardous",
              "E-Waste",
              "Mixed",
              "Non-Recyclable",
            ],
          },

          binColor: {
            type: "string",

            enum: [
              "Blue",
              "Green",
              "Red",
              "Black",
              "Yellow",
            ],
          },

          environmentFriendlyLevel: {
            type: "number",
          },

          recyclable: {
            type: "boolean",
          },

          canBeReused: {
            type: "boolean",
          },

          reuseIdeas: {
            type: "array",

            items: {
              type: "string",
            },
          },

          beforeThrowing: {
            type: "array",

            items: {
              type: "string",
            },
          },

          betterAlternatives: {
            type: "array",

            items: {
              type: "object",

              properties: {
                name: {
                  type: "string",
                },

                ecoBenefit: {
                  type: "string",
                },

                costComparison: {
                  type: "string",
                },
              },

              required: [
                "name",
                "ecoBenefit",
                "costComparison",
              ],

              additionalProperties: false,
            },
          },

          specialHandling: {
            type: "array",

            items: {
              type: "string",
            },
          },

          hazardLevel: {
            type: "string",

            enum: [
              "LOW",
              "MEDIUM",
              "HIGH",
            ],
          },

          confidence: {
            type: "number",
          },
        },

        required: [
          "imageIndex",
          "identifiedObject",
          "material",
          "wasteCategory",
          "binColor",
          "environmentFriendlyLevel",
          "recyclable",
          "canBeReused",
          "reuseIdeas",
          "beforeThrowing",
          "betterAlternatives",
          "specialHandling",
          "hazardLevel",
          "confidence",
        ],

        additionalProperties: false,
      },
    },
  },

  required: ["reports"],

  additionalProperties: false,
};

/* ------------------------------------------------ */
/* ANALYZE */
/* ------------------------------------------------ */

app.post(
  "/api/analyze",

  upload.array("images", 10),

  async (req, res) => {
    try {
      const files = req.files;

      if (!files?.length) {
        return res.status(400).json({
          error: "No images uploaded",
        });
      }

      const models =
        Object.values(MODELS);

      /* ---------------------------- */
      /* CREATE INPUT */
      /* ---------------------------- */

      const createInput = (
        modelName
      ) => {
        const modelPrompt =
          MODEL_PROMPTS[modelName] ||
          "";

        const input = [];

        input.push({
          role: "system",

          content: [
            {
              type: "input_text",

              text: `
${BASE_PROMPT}

${modelPrompt}
`,
            },
          ],
        });

        for (
          let i = 0;
          i < files.length;
          i++
        ) {
          const file = files[i];

          const base64 =
            file.buffer.toString(
              "base64"
            );

          input.push({
            role: "user",

            content: [
              {
                type: "input_text",

                text: `Analyze image ${
                  i + 1
                }`,
              },

              {
                type: "input_image",

                image_url:
                  `data:${file.mimetype};base64,${base64}`,
              },
            ],
          });
        }

        return input;
      };

      /* ---------------------------- */
      /* RUN MODEL */
      /* ---------------------------- */

      async function runModel(
        modelName
      ) {
        const started =
          performance.now();

        try {
          const response =
            await client.responses.create({
              model: modelName,

              input:
                createInput(
                  modelName
                ),

              text: {
                format: {
                  type:
                    "json_schema",

                  name:
                    "waste_detection",

                  strict: true,

                  schema:
                    wasteSchema,
                },
              },
            });

          const ended =
            performance.now();

          const parsedText =
            response.output
              .flatMap(
                (item) =>
                  item.content || []
              )
              .find(
                (content) =>
                  content.type ===
                  "output_text"
              )?.text;

          if (!parsedText) {
            throw new Error(
              "No output text found"
            );
          }

          const parsed =
            JSON.parse(parsedText);

          return {
            success: true,

            model: modelName,

            latencyMs:
              Math.round(
                ended - started
              ),

            usage: {
              inputTokens:
                response.usage
                  ?.input_tokens,

              outputTokens:
                response.usage
                  ?.output_tokens,

              totalTokens:
                response.usage
                  ?.total_tokens,
            },

            parsed,

            rawText: parsedText,

            error: null,
          };
        } catch (error) {
          return {
            success: false,

            model: modelName,

            latencyMs:
              Math.round(
                performance.now() -
                  started
              ),

            usage: null,

            parsed: null,

            rawText: null,

            error: {
              message:
                error.message,
            },
          };
        }
      }

      /* ---------------------------- */
      /* PARALLEL */
      /* ---------------------------- */

      const settled =
        await Promise.allSettled(
          models.map(runModel)
        );

      const results = settled.map(
        (item) =>
          item.status ===
          "fulfilled"
            ? item.value
            : {
                success: false,
                error:
                  item.reason,
              }
      );

      return res.json({
        success: true,

        totalModels:
          models.length,

        results,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error:
          "Benchmark failed",

        details:
          error.message,
      });
    }
  }
);

/* ------------------------------------------------ */
/* HEALTH */
/* ------------------------------------------------ */

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",

    models: Object.keys(MODELS),
  });
});

/* ------------------------------------------------ */
/* SERVER */
/* ------------------------------------------------ */

app.listen(PORT, () => {
  console.log(
    `Waste Detection Backend running on http://localhost:${PORT}`
  );
});