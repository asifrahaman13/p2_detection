/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Fragment, useEffect, useReducer, useState } from "react";
import {
  State,
  Action,
  DocumentData,
  PresignedUrl,
} from "@/types/dashboard/dashboard";
import UploadedPdf from "@/app/components/UploadedPdf";
import axios from "axios";
import config from "@/config/config";

const initialState: State = { activeButton: "Outline" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_TO_OUTLINE":
      return { ...state, activeButton: "Outline" };
    case "TOGGLE_TO_FILES":
      return { ...state, activeButton: "Files" };
    default:
      return state;
  }
}

export default function Page({ params }: { params: { case_name: string } }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [docUrl, setPdfUrl] = React.useState<PresignedUrl | null>(null);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [value, setValue] = useState("x");
  const [preview, setPreview] = useState("x");

  useEffect(() => {
    async function fetchKeypoints() {
      const inputKey = params.case_name.split("/").pop();
      if (!inputKey) {
        console.error("No input key found in params");
        return;
      }
      try {
        const response = await axios.post(
          `${config.backendUrl}/api/v1/pdf/get-key-points`,
          {
            input_key: inputKey,
          },
        );
        const { data } = response;
        console.log("Keypoints data:", data);
        setDocumentData(data);
      } catch (err) {
        console.error("Error fetching keypoints:", err);
      }
    }
    fetchKeypoints();
  }, [params.case_name]);

  useEffect(() => {
    async function fetchPdf() {
      const inputKey = params.case_name.split("/").pop();
      if (!inputKey) {
        console.error("No input key found in params");
        return;
      }
      try {
        const response = await axios.post(
          `${config.backendUrl}/api/v1/pdf/get-presigned-url`,
          {
            input_key: inputKey,
          },
        );
        const { data } = response;
        setPdfUrl({
          original_pdf: data.original_pdf,
          masked_pdf: data.masked_pdf,
        });
      } catch (err) {
        console.error("Error fetching PDF URL:", err);
      }
    }

    fetchPdf();
  }, [params.case_name]);

  function handleValueChange(
    e: React.ChangeEvent<HTMLTextAreaElement>,
    idx: number,
  ): void {
    setDocumentData((prevData) => {
      if (!prevData) return null;
      const newKeyPoints = [...prevData.key_points];
      newKeyPoints[idx] = e.target.value;
      return {
        ...prevData,
        key_points: newKeyPoints,
      };
    });
  }

  function addEmptyKeyPoint(): void {
    setDocumentData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        key_points: [...prev.key_points, ""],
      };
    });
  }

  async function saveData() {
    console.log("Saving data:", documentData);
    if (!documentData) return;
    try {
      const response = await axios.post(
        `${config.backendUrl}/api/v1/pdf/save`,
        documentData,
      );
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

  async function processDocument() {
    console.log("Case name in overview", params.case_name);
    try {
      const response = await axios.post(
        `${config.backendUrl}/api/v1/pdf/process-pdf`,
        {
          input_key: params.case_name,
        },
      );
      console.log("Response from process document", response);
      if (response.status === 200) {
        const { data } = response;
        console.log("Data from process document", data);
      }
    } catch (error: unknown) {
      console.error("Error highlighting pdf", error);
    }
  }

  return (
    <Fragment>
      <div className="p-4 bg-gray-100 w-full">
        <div className="p-2 font-medium text-xl py-4">{params.case_name}</div>
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-4 w-full">
            <button
              className={`text-xl px-2 border-b-2 ${
                state.activeButton === "Outline"
                  ? "border-sideBarBorder font-medium text-buttonTextColor"
                  : "border-transparent text-buttonTextColor"
              }`}
              onClick={() => dispatch({ type: "TOGGLE_TO_OUTLINE" })}
            >
              Outline
            </button>

            <button
              className={`text-xl px-2 ${
                state.activeButton === "Files"
                  ? "border-b-2 border-sideBarBorder font-medium text-buttonTextColor"
                  : "text-buttonTextColor"
              }`}
              onClick={() => dispatch({ type: "TOGGLE_TO_FILES" })}
            >
              Files
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <span
              onClick={() => setPreview("x")}
              className={`px-4 py-1 rounded-l-full border border-blue-600 cursor-pointer ${
                preview === "x"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600"
              }`}
            >
              Original
            </span>

            <div
              className="relative w-12 h-6 bg-gray-300 rounded-full cursor-pointer"
              onClick={() => setPreview(preview === "x" ? "y" : "x")}
            >
              <div
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${
                  preview === "x" ? "translate-x-0" : "translate-x-6"
                }`}
              />
            </div>

            <span
              onClick={() => setPreview("y")}
              className={`px-4 py-1 rounded-r-full border border-blue-600 cursor-pointer ${
                preview === "y"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600"
              }`}
            >
              Preview
            </span>
          </div>
        </div>

        <div className="flex justify-between gap-8 h-3/4 mb-4">
          <div className="flex  w-1/2 gap-4 bg-red-50">
            <div className="bg-white p-6 flex flex-col justify-between gap-2 w-full">
              <div>
                <div className="flex gap-2 items-center">
                  <div className="text-xl font-medium">
                    Add your descriptions
                  </div>
                  <button onClick={addEmptyKeyPoint}>
                    <img src="/assets/dashboard/Circle Plus.svg" alt="Add" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {documentData?.key_points &&
                    documentData.key_points.map((item, index) => (
                      <div className="flex items-center gap-2" key={index}>
                        <textarea
                          className="bg-gray-100 py-1 w-full rounded-md text-center border-0 focus:outline-none focus:ring-0 hover:ring-0"
                          placeholder="Description"
                          value={typeof item === "string" ? item : String(item)}
                          onChange={(e) => handleValueChange(e, index)}
                        />
                      </div>
                    ))}
                </div>
                <div className="flex my-8 flex-col  items-center gap-2 w-full">
                  {/* <div className="w-full font-medium text-lg">Select the type of masking</div> */}
                  <div className="flex items-center space-x-4">
                    <span
                      onClick={() => setValue("x")}
                      className={`px-4 py-1 rounded-l-full border border-blue-600 cursor-pointer ${
                        value === "x"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-blue-600"
                      }`}
                    >
                      Mask
                    </span>

                    <div
                      className="relative w-12 h-6 bg-gray-300 rounded-full cursor-pointer"
                      onClick={() => setValue(value === "x" ? "y" : "x")}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${
                          value === "x" ? "translate-x-0" : "translate-x-6"
                        }`}
                      />
                    </div>

                    <span
                      onClick={() => setValue("y")}
                      className={`px-4 py-1 rounded-r-full border border-blue-600 cursor-pointer ${
                        value === "y"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-blue-600"
                      }`}
                    >
                      Replace
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  className="bg-blue-800 w-1/6 text-white py-2 px-4 rounded-md"
                  onClick={saveData}
                >
                  Save
                </button>
                <button
                  className="bg-blue-800 text-white py-2 px-4 rounded-md"
                  onClick={processDocument}
                >
                  Process
                </button>
              </div>
            </div>
          </div>

          <div className="flex w-1/2 bg-red-50">
            {preview === "x" ? (
              <UploadedPdf uploadedPdf={docUrl?.original_pdf ?? null} />
            ) : (
              <UploadedPdf uploadedPdf={docUrl?.masked_pdf ?? null} />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
