/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import { DocumentData } from "@/types/dashboard/dashboard";
import config from "@/config/config";
import ProgressUpdates from "./ui/ProgressUpdates";

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

  return (
    <div className="bg-white gap-4 h-full p-6 flex flex-col w-full">
      {/* Top Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">ADD INSTRUCTIONS</h2>
        <div className="flex gap-4">
          <button
            className={`py-2 px-4 rounded-md border ${
              isProcessing
                ? "bg-gray-400 text-white cursor-not-allowed"
                : " text-gray-900 "
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

      {/* Middle Section */}
      {!isProcessing && (
        <div className="h-full">
          <div className="text-sm text-gray-500 mb-4 text-justify font-mono">
            These are the key points that will be used by the AI to find the
            fields that need to be extracted. For example, if you want to mask
            out the name of a person, you can add a key point like &quot;Name of
            the person&quot; or &quot;Name of the customer&quot;. The more key
            points you add, the better the AI will be able to find the fields.
          </div>

          <div className="flex-1 overflow-auto space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-200 font-semibold text-gray-700 rounded-md">
              <div>Entity</div>
              <div>Description</div>
              <div>Replace With</div>
              <div className="text-right">Action</div>
            </div>

            {/* Table Body */}
            {data?.key_points.map((point, idx) => (
              <div
                key={idx}
                className="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow-sm border items-start"
              >
                {/* Entity */}
                <textarea
                  rows={3}
                  name="entity"
                  className=" bg-gray-100 text-blue-700 p-3 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Entity"
                  value={point.entity}
                  onChange={(e) => handleChange(e, idx)}
                />

                {/* Description */}
                <textarea
                  rows={3}
                  name="description"
                  className=" bg-gray-100 text-blue-700 p-3 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Description"
                  value={point.description}
                  onChange={(e) => handleChange(e, idx)}
                />

                {/* Replace With */}
                <textarea
                  rows={3}
                  name="replaceWith"
                  className=" bg-gray-100 text-blue-700 p-3 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Replace With"
                  value={point.replaceWith}
                  onChange={(e) => handleChange(e, idx)}
                />

                {/* Delete Button */}
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
        </div>
      )}

      {/* Updates Section */}
      <ProgressUpdates messages={messages} />

      {/* Bottom Controls */}
      <div className="flex justify-between items-center mt-4">
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

        <div className="flex items-center gap-4">
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
    </div>
  );
}
