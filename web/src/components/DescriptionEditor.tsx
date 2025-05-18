/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import { DocumentData } from "@/types/dashboard/dashboard";
import config from "@/config/config";

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
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    idx: number
  ) => {
    if (!data) return;
    const updated = [...data.key_points];
    updated[idx] = e.target.value;
    setData({ ...data, key_points: updated });
  };

  const addPoint = () => {
    if (!data) {
      const pdf = {
        pdf_name: docName,
      };
      setData({ ...pdf, key_points: [""] });
      return;
    }

    setData({ ...data, key_points: [...data.key_points, ""] });
  };

  const handleProcess = () => {
    setIsProcessing(true);
    onProcess();
  };

  useEffect(() => {
    const ws = new WebSocket(
      `${config.websocketUrl}/api/ws/progress/${docName}`
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
    // First create a copy of the key_points array
    const updatedKeyPoints = [...data.key_points];
    // Then remove the item at the specified index
    updatedKeyPoints.splice(idx, 1);
    // Finally, update the state with the new array
    setData({ ...data, key_points: updatedKeyPoints });
  };

  return (
    <div className="bg-white gap-4 h-full p-6 flex flex-col w-full">
      {/* Top Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">ADD INSTRUCTIONS</h2>
        <button onClick={addPoint} disabled={isProcessing}>
          <img
            src="/assets/dashboard/Circle Plus.svg"
            alt="Add"
            className={isProcessing ? "opacity-50 cursor-not-allowed" : ""}
          />
        </button>
      </div>

      {/* Middle Section */}
      {!isProcessing && (
        <div className="h-full">
          <div className="text-sm text-gray-500 mb-4 text-justif font-mono">
            These are the key points that will be used by the AI to find the
            fields that need to be extracted. For example, if you want to mask
            out the name of a person, you can add a key point like &quot;Name of
            the person&quot; or &quot;Name of the customer&quot;. The more key
            points you add, the better the AI will be able to find the fields.
          </div>

          <div className="flex-1 overflow-auto space-y-6">
            {data?.key_points.map((point, idx) => (
              <div className="flex items-center gap-8" key={idx}>
                <div className="flex  bg-blue-100 rounded-xl p-1 px-3 text-blue-600 h-full">{idx + 1}</div>
                <div>
                  <textarea
                    key={idx}
                    className="bg-gray-100 px-2 text-blue-700 py-1 w-full rounded-md items-center border-0 border-none focus:ring-0 focus:outline-none"
                    value={point}
                    onChange={(e) => handleChange(e, idx)}
                  />
                </div>
                <div>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="bg-red-100 p-2 rounded-2xl"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Updates Section */}
      {messages.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-md mt-4 h-full overflow-y-scroll">
          <h3 className="text-sm font-medium text-gray-500 text-center py-2">
            UPDATES
          </h3>
          <div className="flex flex-col gap-2">
            {messages.map((message, index) => (
              <div key={index} className="text-sm text-gray-700 flex gap-2">
                <div className="bg-blue-300 text-blue-800 px-2 py-1 rounded-md">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
                <div className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md">
                  {message.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
