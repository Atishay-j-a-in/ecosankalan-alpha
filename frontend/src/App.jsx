import axios from "axios";
import { useState } from "react";

import { useDropzone } from "react-dropzone";

import {
  Upload,
  Loader2,
  Cpu,
  Clock3,
  Coins,
  AlertTriangle,
  Trash2,
} from "lucide-react";

export default function App() {
  const [backendReady, setBackendReady] =
    useState(false);

  const [warmingUp, setWarmingUp] =
    useState(false);

  const [healthMessage, setHealthMessage] =
    useState("");
  async function wakeBackend() {
    try {
      setWarmingUp(true);

      setHealthMessage(
        "Backend spinning up..."
      );

      const start = Date.now();

      let ready = false;

      while (!ready) {
        try {
          const response =
            await axios.get(
              `${import.meta.env.VITE_API_URL}/api/health`
            );

          if (
            response.data?.status === "ok"
          ) {
            ready = true;

            const seconds =
              (
                (Date.now() - start) /
                1000
              ).toFixed(1);

            setBackendReady(true);

            setHealthMessage(
              `Backend ready in ${seconds}s. You can now proceed.`
            );
          }
        } catch (err) {
          /* backend still waking */
        }

        if (!ready) {
          await new Promise((r) =>
            setTimeout(r, 3000)
          );
        }
      }
    } catch (error) {
      console.error(error);

      setHealthMessage(
        "Failed to start backend."
      );
    } finally {
      setWarmingUp(false);
    }
  }
  const [backendReady, setBackendReady] =
    useState(false);

  const [warmingUp, setWarmingUp] =
    useState(false);

  const [healthMessage, setHealthMessage] =
    useState("");
  const [images, setImages] =
    useState([]);

  const [preview, setPreview] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [results, setResults] =
    useState([]);

  {/* BACKEND STATUS */ }

  <div className="mb-8">

    {!backendReady ? (
      <div
        className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-6
      "
      >

        <div className="flex items-center justify-between gap-6 flex-wrap">

          <div>

            <h2 className="text-2xl font-bold">
              Backend Service
            </h2>

            <p className="text-zinc-400 mt-2">
              Render backend may sleep on free tier.
            </p>

            {!!healthMessage && (
              <p className="mt-4 text-green-400">
                {healthMessage}
              </p>
            )}

          </div>

          <button
            onClick={wakeBackend}
            disabled={warmingUp}
            className="
            bg-green-500
            hover:bg-green-400
            transition
            text-black
            font-semibold
            px-6
            py-3
            rounded-2xl
            disabled:opacity-50
            flex
            items-center
            gap-3
          "
          >

            {warmingUp ? (
              <>
                <Loader2 className="animate-spin" />

                Spinning Up...
              </>
            ) : (
              "Start Backend"
            )}

          </button>

        </div>
      </div>
    ) : (
      <div
        className="
        bg-green-500/10
        border
        border-green-500/20
        rounded-3xl
        p-6
      "
      >

        <div className="text-green-300 font-semibold text-lg">
          Backend Ready
        </div>

        <p className="text-green-400 mt-2">
          You can now proceed with testing.
        </p>

      </div>
    )}

  </div>
  /* -------------------------------- */
  /* DROPZONE */
  /* -------------------------------- */

  const onDrop = (acceptedFiles) => {
    setImages(acceptedFiles);

    setPreview(
      acceptedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
    );
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,

    accept: {
      "image/*": [],
    },

    multiple: true,
  });

  /* -------------------------------- */
  /* REMOVE IMAGE */
  /* -------------------------------- */

  function removeImage(index) {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setPreview((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  /* -------------------------------- */
  /* ANALYZE */
  /* -------------------------------- */

  async function handleAnalyze() {
    try {
      if (!images.length) return;

      setLoading(true);

      const formData = new FormData();

      images.forEach((img) => {
        formData.append("images", img);
      });

      const response =
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/analyze`,
          formData
        );

      setResults(response.data.results);
    } catch (error) {
      console.error(error);

      alert("Benchmark failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* HEADER */}

      <div className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              Waste AI Benchmark
            </h1>

            <p className="text-zinc-400 mt-1">
              Compare OpenAI Models
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={
              loading || !images.length
            }
            className="
              bg-green-500
              hover:bg-green-400
              transition
              text-black
              font-semibold
              px-6
              py-3
              rounded-2xl
              disabled:opacity-50
              flex
              items-center
              gap-2
            "
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Benchmarking
              </>
            ) : (
              "Run Benchmark"
            )}
          </button>

        </div>
      </div>

      {/* MAIN */}

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* DROPZONE */}

        <div
          {...getRootProps()}
          className={`
            border-2
            border-dashed
            rounded-3xl
            p-16
            text-center
            transition
            cursor-pointer

            ${isDragActive
              ? "border-green-400 bg-green-500/10"
              : "border-zinc-700 hover:border-green-400"
            }
          `}
        >

          <input {...getInputProps()} />

          <div className="flex flex-col items-center">

            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">

              <Upload size={40} />

            </div>

            <h2 className="text-3xl font-bold mt-8">
              Drag & Drop Images
            </h2>

            <p className="text-zinc-400 mt-4">
              Upload waste images to compare all models
            </p>

          </div>
        </div>

        {/* PREVIEW */}

        {!!preview.length && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10">

            {preview.map((item, idx) => (
              <div
                key={idx}
                className="relative group"
              >

                <img
                  src={item.url}
                  className="
                    h-56
                    w-full
                    object-cover
                    rounded-3xl
                    border
                    border-zinc-800
                  "
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    removeImage(idx);
                  }}
                  className="
                    absolute
                    top-3
                    right-3
                    w-10
                    h-10
                    rounded-full
                    bg-black/70
                    backdrop-blur-xl
                    flex
                    items-center
                    justify-center
                    opacity-0
                    group-hover:opacity-100
                    transition
                  "
                >
                  <Trash2 size={18} />
                </button>

              </div>
            ))}

          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="mt-10 flex items-center gap-3 text-lg text-zinc-300">

            <Loader2 className="animate-spin" />

            Running all models...

          </div>
        )}

        {/* RESULTS */}

        {!!results.length && (
          <div className="mt-14 grid lg:grid-cols-2 gap-7">

            {results.map((modelResult) => (
              <div
                key={modelResult.model}
                className="
                  bg-zinc-900/70
                  border
                  border-zinc-800
                  rounded-[32px]
                  p-7
                  backdrop-blur-xl
                "
              >

                {/* MODEL HEADER */}

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-3xl font-bold">
                      {modelResult.model}
                    </h2>

                    <p className="text-zinc-400 mt-1">
                      OpenAI Vision Benchmark
                    </p>

                  </div>

                  {!modelResult.success && (
                    <AlertTriangle className="text-red-400" />
                  )}

                </div>

                {/* ERROR */}

                {!modelResult.success ? (
                  <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-300">

                    {modelResult.error?.message}

                  </div>
                ) : (
                  <>
                    {/* STATS */}

                    <div className="grid grid-cols-3 gap-4 mt-8">

                      <div className="bg-zinc-800 rounded-2xl p-4">

                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <Clock3 size={16} />
                          Latency
                        </div>

                        <div className="text-2xl font-bold mt-2">
                          {(
                            modelResult.latencyMs / 1000
                          ).toFixed(2)}
                          s
                        </div>

                      </div>

                      <div className="bg-zinc-800 rounded-2xl p-4">

                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <Coins size={16} />
                          Tokens
                        </div>

                        <div className="text-2xl font-bold mt-2">
                          {
                            modelResult.usage
                              ?.totalTokens
                          }
                        </div>

                      </div>

                      <div className="bg-zinc-800 rounded-2xl p-4">

                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <Cpu size={16} />
                          Output
                        </div>

                        <div className="text-2xl font-bold mt-2">
                          {
                            modelResult.parsed
                              ?.reports
                              ?.length
                          }
                        </div>

                      </div>

                    </div>

                    {/* REPORTS */}

                    <div className="space-y-6 mt-8">
                      <div className="space-y-6 mt-8">

                        {modelResult.parsed?.reports?.map(
                          (report, idx) => (
                            <div
                              key={idx}
                              className="
          bg-zinc-800/70
          rounded-3xl
          p-6
          border
          border-zinc-700
        "
                            >

                              {/* TOP */}

                              <div className="flex items-start justify-between">

                                <div>

                                  <h3 className="text-2xl font-bold">
                                    {report.identifiedObject}
                                  </h3>

                                  <p className="text-zinc-400 mt-2">
                                    {report.material}
                                  </p>

                                </div>

                                <div className="text-right">

                                  <div className="text-zinc-500 text-sm">
                                    Confidence
                                  </div>

                                  <div className="text-2xl font-bold mt-1">
                                    {Math.round(
                                      report.confidence * 100
                                    )}
                                    %
                                  </div>

                                </div>

                              </div>

                              {/* TAGS */}

                              <div className="flex flex-wrap gap-3 mt-6">

                                <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full">
                                  ♻ {report.wasteCategory}
                                </div>

                                <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full">
                                  Bin: {report.binColor}
                                </div>

                                <div className="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full">
                                  Eco:
                                  {" "}
                                  {
                                    report.environmentFriendlyLevel
                                  }
                                </div>

                                <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full">
                                  Hazard:
                                  {" "}
                                  {report.hazardLevel}
                                </div>

                              </div>

                              {/* RECYCLABLE */}

                              <div className="mt-6">

                                <div className="font-semibold text-lg">
                                  Recycling Info
                                </div>

                                <div className="mt-3 text-zinc-300">

                                  Recyclable:
                                  {" "}
                                  <span className="font-bold">
                                    {report.recyclable
                                      ? "Yes"
                                      : "No"}
                                  </span>

                                </div>

                                <div className="mt-2 text-zinc-300">

                                  Reusable:
                                  {" "}
                                  <span className="font-bold">
                                    {report.canBeReused
                                      ? "Yes"
                                      : "No"}
                                  </span>

                                </div>

                              </div>

                              {/* REUSE IDEAS */}

                              <div className="mt-8">

                                <div className="font-semibold text-lg">
                                  Reuse Ideas
                                </div>

                                <ul className="mt-3 space-y-2 text-zinc-300">

                                  {report.reuseIdeas?.map(
                                    (idea, i) => (
                                      <li key={i}>
                                        • {idea}
                                      </li>
                                    )
                                  )}

                                </ul>

                              </div>

                              {/* BEFORE THROWING */}

                              <div className="mt-8">

                                <div className="font-semibold text-lg">
                                  Before Throwing
                                </div>

                                <ul className="mt-3 space-y-2 text-zinc-300">

                                  {report.beforeThrowing?.map(
                                    (step, i) => (
                                      <li key={i}>
                                        • {step}
                                      </li>
                                    )
                                  )}

                                </ul>

                              </div>

                              {/* SPECIAL HANDLING */}

                              <div className="mt-8">

                                <div className="font-semibold text-lg">
                                  Special Handling
                                </div>

                                <ul className="mt-3 space-y-2 text-zinc-300">

                                  {report.specialHandling?.map(
                                    (step, i) => (
                                      <li key={i}>
                                        • {step}
                                      </li>
                                    )
                                  )}

                                </ul>

                              </div>

                              {/* BETTER ALTERNATIVES */}

                              <div className="mt-8">

                                <div className="font-semibold text-lg">
                                  Better Alternatives
                                </div>

                                <div className="space-y-4 mt-4">

                                  {report.betterAlternatives?.map(
                                    (alt, i) => (
                                      <div
                                        key={i}
                                        className="
                    bg-zinc-900
                    rounded-2xl
                    p-5
                    border
                    border-zinc-700
                  "
                                      >

                                        <div className="text-lg font-bold">
                                          {alt.name}
                                        </div>

                                        <div className="text-zinc-400 mt-2">
                                          {alt.ecoBenefit}
                                        </div>

                                        <div className="text-green-400 mt-3 text-sm">
                                          {
                                            alt.costComparison
                                          }
                                        </div>

                                      </div>
                                    )
                                  )}

                                </div>

                              </div>

                            </div>
                          )
                        )}

                      </div>

                    </div>
                  </>
                )}
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}