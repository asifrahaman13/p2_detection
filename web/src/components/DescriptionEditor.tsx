/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import { DocumentData } from "@/types/dashboard/dashboard";
import config from "@/config/config";
import ProgressUpdates from "./ui/ProgressUpdates";
import { useDocumentData } from "@/hooks/useDocumentData";

interface Props {
  docName: string;
  data: DocumentData | null;
  setData: React.Dispatch<React.SetStateAction<DocumentData | null>>;
  onSave: () => void;
  onProcess: () => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
}

type ProgressMessage = {
  status: string;
  timestamp: number;
};

export default function DescriptionEditor({
  docName,
  data,
  setData,
  onSave,
  onProcess,
  viewMode,
  setViewMode,
}: Props) {
  const [messages, setMessages] = useState<ProgressMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (data) onSave();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [data, onSave]);
  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    idx: number,
  ) => {
    if (!data) return;
    const { name, value } = e.target;

    const updatedKeyPoints = data.key_points.map((point, i) =>
      i === idx ? { ...point, [name]: value } : point,
    );

    console.log("Updated key points:", updatedKeyPoints);

    setData({ ...data, key_points: updatedKeyPoints });
  };

  const addPoint = () => {
    if (!data) {
      const pdf = {
        pdf_name: docName,
      };
      setData({
        ...pdf,
        key_points: [
          {
            entity: "",
            description: "",
            replaceWith: "",
          },
        ],
      });
      return;
    }

    setData({
      ...data,
      key_points: [
        ...data.key_points,
        {
          entity: "",
          description: "",
          replaceWith: "",
        },
      ],
    });
  };

  const handleProcess = () => {
    setIsProcessing(true);
    onProcess();
  };

  const exportToJson = (data: DocumentData, docName: string) => {
    if (!data) return;

    const fileData = JSON.stringify(data.key_points, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${docName || "ruleset"}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const ws = new WebSocket(
      `${config.websocketUrl}/api/ws/progress/${docName}`,
    );
    if (!wsRef.current) {
      wsRef.current = ws;
    }

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.status === "completed") {
        setIsProcessing(false);
      }
      setMessages((prev) => [...prev, parsedData]);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [docName]);

  const handleDelete = (idx: number) => {
    if (!data) return;
    const updatedKeyPoints = [...data.key_points];
    updatedKeyPoints.splice(idx, 1);
    setData({ ...data, key_points: updatedKeyPoints });
  };

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        console.log(json);

        if (!Array.isArray(json)) {
          console.error("Invalid JSON format: not an array.");
          return;
        }

        const isValid = json.every(
          (item) =>
            typeof item.entity === "string" &&
            typeof item.description === "string" &&
            typeof item.replaceWith === "string",
        );

        if (!isValid) {
          console.error(
            "Invalid JSON format: items do not match expected shape.",
          );
          return;
        }

        const pdf = {
          pdf_name: docName,
          key_points: json,
        };

        setData(pdf);
      } catch (err) {
        console.error("Failed to parse JSON file:", err);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="bg-white flex flex-col h-full w-full p-6 gap-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-xl font-medium">ADD INSTRUCTIONS</h2>
        <div className="flex gap-4 items-center">
          <label className="cursor-pointer bg-sideBarGradient hover:bg-sideBarGradient text-white px-5 py-2 rounded-lg shadow transition duration-200">
            Import JSON
            <input
              type="file"
              accept="application/json"
              onChange={handleJsonUpload}
              className="hidden"
            />
          </label>

          <button
            className={`py-2 px-4 rounded-md border ${
              isProcessing
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "text-gray-900"
            }`}
            onClick={() => {
              if (data) exportToJson(data, docName);
            }}
            disabled={isProcessing}
          >
            Export
          </button>

          <button onClick={addPoint} disabled={isProcessing}>
            <img
              src="/assets/dashboard/Circle Plus.svg"
              alt="Add"
              className={isProcessing ? "opacity-50 cursor-not-allowed" : ""}
            />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {!isProcessing && (
          <>
            <div className="text-sm text-gray-500 text-justify font-mono">
              These are the key points that will be used by the AI...
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-100 font-semibold text-gray-700 rounded-md">
              <div>Entity</div>
              <div>Description</div>
              <div>Replace With</div>
              <div className="text-right">Action</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-4">
              {data?.key_points.map((point, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow-sm border"
                >
                  <textarea
                    rows={3}
                    name="entity"
                    className="text-gray-900 p-3 w-full rounded-md outline-none"
                    placeholder="Entity"
                    value={point.entity}
                    onChange={(e) => handleChange(e, idx)}
                  />

                  <textarea
                    rows={3}
                    name="description"
                    className="text-gray-900 p-3 w-full rounded-md outline-none"
                    placeholder="Description"
                    value={point.description}
                    onChange={(e) => handleChange(e, idx)}
                  />

                  <textarea
                    rows={3}
                    name="replaceWith"
                    className="text-gray-900 p-3 w-full rounded-md outline-none"
                    placeholder="Replace With"
                    value={point.replaceWith}
                    onChange={(e) => handleChange(e, idx)}
                  />

                  <div className="flex justify-end items-start pt-1">
                    <button
                      onClick={() => handleDelete(idx)}
                      className="text-sm bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-full"
                    >
                      ❌ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Progress Section */}
        <ProgressUpdates messages={messages} />
      </div>

      {/* Bottom Fixed Controls */}
      <div className="shrink-0 pt-4 border-t mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span
            onClick={() => setViewMode("x")}
            className={`px-4 py-1 rounded-l-full border cursor-pointer ${
              viewMode === "x"
                ? "bg-sideBarGradient text-white"
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
                ? "bg-sideBarGradient text-white"
                : "bg-white text-blue-600"
            }`}
          >
            Replace
          </span>
        </div>

        <button
          className={`py-2 px-4 rounded-md ${
            isProcessing
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-sideBarGradient text-white"
          }`}
          onClick={handleProcess}
          disabled={isProcessing}
        >
          Process
        </button>
      </div>
    </div>
  );
}
