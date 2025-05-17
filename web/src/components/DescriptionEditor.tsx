/* eslint-disable @next/next/no-img-element */
import React from "react";
import { DocumentData } from "@/types/dashboard/dashboard";

interface Props {
  data: DocumentData | null;
  setData: React.Dispatch<React.SetStateAction<DocumentData | null>>;
  onSave: () => void;
  onProcess: () => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
}

export default function DescriptionEditor({
  data,
  setData,
  onSave,
  onProcess,
  viewMode,
  setViewMode,
}: Props) {
  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    idx: number,
  ) => {
    if (!data) return;
    const updated = [...data.key_points];
    updated[idx] = e.target.value;
    setData({ ...data, key_points: updated });
    onSave();
  };

  const addPoint = () => {
    if (!data) return;
    setData({ ...data, key_points: [...data.key_points, ""] });
  };

  return (
    <div className="bg-white h-full p-6 flex flex-col w-full">
      {/* Top Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Add your descriptions</h2>
        <button onClick={addPoint}>
          <img src="/assets/dashboard/Circle Plus.svg" alt="Add" />
        </button>
      </div>

      {/* Middle Section (growable area) */}
      <div className="flex-1 overflow-auto space-y-2">
        {data?.key_points.map((point, idx) => (
          <textarea
            key={idx}
            className="bg-gray-100 py-1 w-full rounded-md text-center border-0"
            value={point}
            onChange={(e) => handleChange(e, idx)}
          />
        ))}
      </div>

      {/* Bottom Button Section */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-4">
          <span
            onClick={() => setViewMode("x")}
            className={`px-4 py-1 rounded-l-full border cursor-pointer ${
              viewMode === "x"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600"
            }`}
          >
            Mask
          </span>
          <div
            className="relative w-12 h-6 bg-gray-300 rounded-full cursor-pointer"
            onClick={() => setViewMode(viewMode === "x" ? "y" : "x")}
          >
            <div
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                viewMode === "x" ? "translate-x-0" : "translate-x-6"
              }`}
            />
          </div>
          <span
            onClick={() => setViewMode("y")}
            className={`px-4 py-1 rounded-r-full border cursor-pointer ${
              viewMode === "y"
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600"
            }`}
          >
            Replace
          </span>
        </div>

        <button
          className="bg-blue-800 text-white py-2 px-4 rounded-md"
          onClick={onProcess}
        >
          Process
        </button>
      </div>
    </div>
  );
}
