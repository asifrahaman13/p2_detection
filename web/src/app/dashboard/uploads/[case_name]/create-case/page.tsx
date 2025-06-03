/* eslint-disable @next/next/no-img-element */
"use client";
import React, { Fragment, useReducer, useState, use } from "react";
import DefineComponent from "./DefineComponent";
import axios from "axios";
import config from "@/config/config";

import Link from "next/link";

interface State {
  define: boolean;
  upload: boolean;
  process: boolean;
}

type Action =
  | { type: "TOGGLE_DEFINE" }
  | { type: "TOGGLE_UPLOAD" }
  | { type: "TOGGLE_PROCESS" };

const initialState: State = {
  define: false,
  upload: false,
  process: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "TOGGLE_DEFINE":
      return { ...state, define: !state.define };
    case "TOGGLE_UPLOAD":
      return { ...state, upload: !state.upload };
    case "TOGGLE_PROCESS":
      return { ...state, process: !state.process };
    default:
      return state;
  }
};

export default function Page(props: {
  params: Promise<{ case_name: string }>;
}) {
  const params = use(props.params);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [display, setDisplay] = useState("define");
  const [loading, setLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState("");

  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [dynamicValue, setDynamicValue] = useState(0);

  async function handleFileChange(file: File | null) {
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);

      await handleFileUpload(file);
    }
  }
  async function handleFileUpload(file: File) {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", params.case_name);
    setDynamicValue(0);

    const interval = setInterval(() => {
      setDynamicValue((prevValue) => {
        if (prevValue < 100) {
          if (fileSize === null) {
            return prevValue + 1;
          }
          return prevValue + 1 / (fileSize * 1.5);
        } else {
          clearInterval(interval);
          return prevValue;
        }
      });
    }, 100);

    try {
      const response = await axios.post(
        `${config.backendUrl}/api/v1/docs/upload-docs`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200) {
        console.log(response.data);
        setLoading(false);
        setDynamicValue(100);
        setFileUploaded(true);
        setPresignedUrl(response.data.presigned_url);
      }
    } catch (error: unknown) {
      console.error("Error uploading PDF:", error);
      clearInterval(interval);
      setLoading(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileChange(file);
  }

  function formatFileSize(fileSize: number | null) {
    if (fileSize === null) {
      return;
    }
    if (fileSize < 1024 * 1024) {
      return `${(fileSize / 1024).toFixed(2)} KB`;
    } else {
      return `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  return (
    <Fragment>
      <div className="w-full h-screen p-4">
        <div className="text-blue-600">
          <Link href="/dashboard/cases">Cases/create cases</Link>
        </div>

        <div className="w-full h-full flex gap-6 items-center flex-col ">
          <div className="flex gap-2 items-center">
            <div
              className="flex gap-4 items-center"
              onClick={() => dispatch({ type: "TOGGLE_DEFINE" })}
            >
              <div
                className={`${
                  state.define
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border-2 border-blue-600"
                } rounded-2xl h-8 w-8 flex justify-center items-center cursor-pointer`}
              >
                1
              </div>
              <div className="font-medium text-buttonTextColor">Define</div>
              <div
                className={`w-24 h-1 ${
                  state.define ? "bg-blue-600" : "bg-white"
                } mt-2`}
              ></div>
            </div>

            <div
              className="flex gap-4 items-center"
              onClick={() => dispatch({ type: "TOGGLE_UPLOAD" })}
            >
              <div
                className={`${
                  state.upload
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border-2 border-blue-600"
                } rounded-2xl h-8 w-8 flex justify-center items-center cursor-pointer`}
              >
                2
              </div>
              <div className="text-buttonTextColor font-medium">Upload</div>
              <div
                className={`w-24 h-1 ${
                  state.upload ? "bg-blue-600" : "bg-white"
                } mt-2`}
              ></div>
            </div>

            <div
              className="flex gap-4 items-center"
              onClick={() => dispatch({ type: "TOGGLE_PROCESS" })}
            >
              <div
                className={`${
                  state.process
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border-2 border-blue-600"
                } rounded-2xl h-8 w-8 flex justify-center items-center cursor-pointer`}
              >
                3
              </div>
              <div className="text-buttonTextColor font-medium">Process</div>
            </div>
          </div>

          {display === "define" && (
            <Fragment>
              <div className="flex flex-col bg-white w-3/4 gap-6 rounded-lg mt-4 p-4">
                <div className="text-xl font-medium">Upload file</div>
                <div
                  className="flex justify-center w-full"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="border-2 w-3/4 py-6 rounded-xl border-dotted">
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src="/assets/dashboard/Group.svg"
                        alt="Select File"
                        onClick={() =>
                          document.getElementById("fileInput")?.click()
                        }
                        className="cursor-pointer"
                      />
                      <p className="text-gray-500 text-lg mt-4">
                        Click on the image or drag and drop a file here
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        DOC or PDF, file size no more than 100MB
                      </p>

                      <input
                        id="fileInput"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          handleFileChange(e.target.files?.[0] ?? null)
                        }
                        className="hidden"
                      />
                      {loading && (
                        <>
                          <div className="w-full  px-8  flex-col gap-2 p-2 items-center">
                            <div className="font-medium text-lg w-1/2">
                              File added
                            </div>
                            <div className="flex gap-2">
                              <img
                                src="/assets/dashboard/bi_file-earmark-image.svg"
                                alt=""
                              />
                              <div className="flex flex-col w-full">
                                <div className="flex w-full justify-between">
                                  <div>{fileName}</div>
                                  <div>{formatFileSize(fileSize)}</div>
                                </div>
                                <div className="h-1 bg-gray-100 w-full">
                                  <div
                                    className="h-1 bg-blue-600"
                                    style={{ width: `${dynamicValue}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {fileUploaded === true && (
                        <>
                          <div className="w-full py-12 flex flex-col items-center">
                            <div className="w-3/5 flex flex-col gap-2">
                              <div className="text-lg font-medium">
                                File uploaded
                              </div>
                              <div className="flex gap-2  justify-between">
                                <div className="flex gap-2">
                                  <div>
                                    <img
                                      src="/assets/dashboard/uploaded.svg"
                                      alt=""
                                    />
                                  </div>
                                  <div>{fileName}</div>
                                  <a
                                    href={presignedUrl}
                                    target="_blank"
                                    className="text-blue-600"
                                  >
                                    Preview
                                  </a>
                                </div>
                                <div>{formatFileSize(fileSize)}</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full justify-center flex">
                  <button
                    className="bg-blueButton text-white py-2 px-4 rounded-md"
                    onClick={() => {
                      setDisplay("upload");
                      dispatch({ type: "TOGGLE_DEFINE" });
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </Fragment>
          )}

          {display === "upload" && (
            <Fragment>
              <DefineComponent
                case_name={params.case_name}
                callbackFunction={() => dispatch({ type: "TOGGLE_UPLOAD" })}
                triggerProcess={() => dispatch({ type: "TOGGLE_PROCESS" })}
              />
            </Fragment>
          )}
        </div>
      </div>
    </Fragment>
  );
}
