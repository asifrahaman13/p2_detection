/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Fragment, useEffect, useReducer } from "react";
import { State, Action } from "@/types/dashboard/dashboard";
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
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  useEffect(() => {
    async function fetchPdf() {
      // Find the input key from params

      const inputKey = params.case_name.split("/").pop();
      console.log("Input Key:", inputKey);
      if (!inputKey) {
        console.error("No input key found in params");
      }
      const response = await axios.post(
        `${config.backendUrl}/api/v1/pdf/get-presigned-url`,
        {
          input_key: inputKey,
        },
      );
      const { data } = response;
      console.log("PDF URL:", data);
      setPdfUrl(data.presigned_url);
    }

    fetchPdf();
  }, [params.case_name]);

  return (
    <Fragment>
      <div className="p-4 bg-gray-100 w-full">
        {/* Header */}
        <div className="p-2 font-medium text-xl py-4">{params.case_name}</div>
        <div className="flex justify-between mb-4">
          <div className=" flex items-center gap-4  w-full">
            <button
              className={`text-xl  px-2 border-b-2 ${
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
        </div>

        <div className="flex gap-4 h-3/4">
          <div className="w-1/2"></div>
          <div className="w-1/2 my-6 ">
            <UploadedPdf uploadedPdf={pdfUrl} />
          </div>
        </div>
      </div>
    </Fragment>
  );
}
