"use client";

import type { Prediction } from "@/lib/tensorflow";

interface Props {
  predictions: Prediction[];
  onSelect: (prediction: Prediction) => void;
}

export default function PredictionPicker({ predictions, onSelect }: Props) {
  return (
    <div className="w-full space-y-3">
      <p className="text-center text-sm text-slate-400">
        What did you snap? Tap to search for recipes.
      </p>
      {predictions.map((p) => (
        <button
          key={p.label}
          onClick={() => onSelect(p)}
          className="w-full rounded-xl bg-slate-800 p-4 text-left transition hover:bg-slate-700 active:scale-95"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold capitalize text-white">
              {p.query}
            </span>
            <span className="text-xs text-slate-400">
              {Math.round(p.confidence * 100)}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{ width: `${Math.round(p.confidence * 100)}%` }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
