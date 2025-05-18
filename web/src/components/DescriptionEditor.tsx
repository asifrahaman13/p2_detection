/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import { DocumentData } from "@/types/dashboard/dashboard";

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

  const [messages, setMessages] = useState<ProgressMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log("WebSocket connection opened");
    console.log("This is the data");
    console.log(docName);
    const ws = new WebSocket(`ws://127.0.0.1:8000/api/ws/progress/${docName}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      console.log("Received:", event.data);
      const parsedData = JSON.parse(event.data);
      console.log("Parsed Data:", parsedData);
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
  }, []);

  return (
    <div className="bg-white gap-4 h-full p-6 flex flex-col w-full">
      {/* Top Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">ADD INSTRUCTIONS</h2>
        <button onClick={addPoint}>
          <img src="/assets/dashboard/Circle Plus.svg" alt="Add" />
        </button>
      </div>
      <div className="text-sm text-gray-500 mb-4 text-justif font-mono">
        These are the key points that will be used by the AI to find the fields
        that needs to be extracted. For example, if you have want to mask out
        the name of the person, you can add a key point like &quot;Name of the
        person&quot; or &quot;Name of the customer&quot;. You can also add
        multiple key points. The more key points you add, the better the AI will
        be able to find the fields that needs to be extracted.
      </div>
      {/* Middle Section (growable area) */}
      <div className="flex-1 overflow-auto space-y-2">
        {data?.key_points.map((point, idx) => (
          <textarea
            key={idx}
            className="bg-gray-100 py-1 w-full rounded-md text-center border-0 border-none focus:ring-0 focus:outline-none"
            value={point}
            onChange={(e) => handleChange(e, idx)}
          />
        ))}
      </div>

      {/* Bottom Button Section */}

      {messages.length > 0 ? (
        <div className="bg-gray-100 p-4 rounded-md mt-4 h-1/3 overflow-y-scroll">
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
      ) : (
        <>
          {wsRef.current && (
            <div className="flex justify-between items-center mt-4">
              {/* <div>{wsRef.current.to}</div> */}
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
          )}
        </>
      )}
    </div>
  );
}
