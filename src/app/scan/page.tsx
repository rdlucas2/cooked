"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CameraInput from "@/components/CameraInput";
import PredictionPicker from "@/components/PredictionPicker";
import type { Prediction } from "@/lib/tensorflow";

type Stage = "idle" | "loading-model" | "classifying" | "pick";

export default function ScanPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading-model");
  const [preview, setPreview] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    import("@/lib/tensorflow").then(({ loadModel }) =>
      loadModel().then(() => setStage("idle"))
    );
  }, []);

  async function handleImage(img: HTMLImageElement, previewUrl: string) {
    setPreview(previewUrl);
    setStage("classifying");
    const { classifyImage } = await import("@/lib/tensorflow");
    const results = await classifyImage(img);
    setPredictions(results);
    setStage("pick");
  }

  function handleSelect(p: Prediction) {
    router.push(`/results?q=${encodeURIComponent(p.query)}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 px-4 py-10">
      <header className="flex w-full max-w-md items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-slate-400 hover:text-white"
          aria-label="Go back"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Scan Food</h1>
      </header>

      <div className="w-full max-w-md space-y-6">
        {preview && (
          <img
            src={preview}
            alt="Food preview"
            className="w-full rounded-2xl object-cover max-h-64"
          />
        )}

        {(stage === "idle" || stage === "loading-model") && (
          <CameraInput
            onImage={handleImage}
            disabled={stage === "loading-model"}
          />
        )}

        {stage === "classifying" && (
          <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            <span>Identifying food…</span>
          </div>
        )}

        {stage === "pick" && predictions.length > 0 && (
          <>
            <PredictionPicker predictions={predictions} onSelect={handleSelect} />
            <button
              onClick={() => {
                setStage("idle");
                setPreview(null);
                setPredictions([]);
              }}
              className="w-full rounded-xl border border-slate-700 py-3 text-sm text-slate-400 hover:text-white"
            >
              Retake photo
            </button>
          </>
        )}

        {stage === "pick" && predictions.length === 0 && (
          <div className="rounded-xl bg-slate-800 p-6 text-center text-slate-400">
            <p>Could not identify food. Try a clearer photo.</p>
            <button
              onClick={() => { setStage("idle"); setPreview(null); }}
              className="mt-4 text-orange-400 underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
