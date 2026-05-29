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

module.exports = {
  wasteSchema,
};
