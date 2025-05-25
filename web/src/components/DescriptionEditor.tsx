/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { DocumentData, KeyPoint } from "@/types/dashboard/dashboard";
import config from "@/config/config";
import ProgressUpdates from "./ui/ProgressUpdates";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  addKeyPoint,
  removeKeyPoint,
  setDocumentData,
  setProcessType,
  updateKeyPoint,
} from "@/lib/features/docSlice";
import { useDispatch } from "react-redux";
import { exportToJson } from "@/utils/parseInputKey";

interface Props {
  docName: string;
  data: DocumentData | null;
  onSave: () => void;
  onProcess: () => void;
}

type ProgressMessage = {
  status: string;
  timestamp: number;
};

export default function DescriptionEditor({
  docName,
  data,
  onSave,
  onProcess,
}: Props) {
  const [messages, setMessages] = useState<ProgressMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const dispatch = useDispatch();

  const doc = useSelector((state: RootState) => state.docSlice);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (data) onSave();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [data, onSave]);

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
      console.log("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [docName]);

  function handleChange(
    e: React.ChangeEvent<HTMLTextAreaElement>,
    idx: number,
  ) {
    const { name, value } = e.target;
    dispatch(
      updateKeyPoint({ index: idx, field: name as keyof KeyPoint, value }),
    );
  }

  function addPoint() {
    dispatch(addKeyPoint());
  }

  function handleProcess() {
    setIsProcessing(true);
    onProcess();
  }

  function handleDelete(idx: number) {
    dispatch(removeKeyPoint(idx));
  }

  function handleJsonUpload(event: React.ChangeEvent<HTMLInputElement>) {
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
        dispatch(setDocumentData(pdf));
      } catch (err) {
        console.error("Failed to parse JSON file:", err);
      }
    };

    reader.readAsText(file);
  }

  function toogleProcessMode(mode: string) {
    if (!data) {
      return;
    }
    dispatch(setProcessType(mode));
  }

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
              disabled={isProcessing}
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
              if (doc.data) exportToJson(doc.data, docName);
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
              {doc.data?.key_points.map((point, idx) => (
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
                    rows={point.description.length / 15}
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
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <ProgressUpdates messages={messages} />
      </div>

      <div className="shrink-0 pt-4 border-t mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span
            onClick={() => toogleProcessMode("mask")}
            className={`px-4 py-1 rounded-l-full border cursor-pointer ${
              data?.process_type === "mask"
                ? "bg-sideBarGradient text-white"
                : "bg-white text-blue-600"
            }`}
          >
            Mask
          </span>
          <span
            onClick={() => toogleProcessMode("replace")}
            className={`px-4 py-1 rounded-r-full border cursor-pointer ${
              data?.process_type === "replace"
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
