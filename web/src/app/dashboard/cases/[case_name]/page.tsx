"use client";

import React, { useReducer, useState, use } from "react";
import UploadedPdf from "@/components/UploadedPdf";
import DescriptionEditor from "@/components/DescriptionEditor";
import ToggleTabs from "@/components/ToggleTabs";
import { useDocumentData } from "@/hooks/useDocumentData";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";
import { State, Action } from "@/types/dashboard/dashboard";
import axios from "axios";
import config from "@/config/config";
import Result from "@/components/Result";
import { useRouter } from "next/navigation";

const initialState: State = { activeButton: "OUTLINE" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_TO_OUTLINE":
      return { activeButton: "OUTLINE" };
    case "TOGGLE_TO_RESULT":
      return { activeButton: "RESULT" };
    default:
      return state;
  }
}

export default function Page(props: {
  params: Promise<{ case_name: string }>;
}) {
  const params = use(props.params);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [preview, setPreview] = useState("x");
  const [pageNum, setPageNum] = useState<number>(1);

  const [documentData, setDocumentData] = useDocumentData(params.case_name);
  const docUrl = usePresignedUrl(params.case_name);
  const router = useRouter();

  const saveData = async () => {
    if (!documentData) return;
    try {
      await axios.post(`${config.backendUrl}/api/v1/docs/save`, documentData);
    } catch (err) {
      console.error("Error saving data", err);
    }
  };

  const processDocument = async () => {
    try {
      await axios.post(`${config.backendUrl}/api/v1/docs/process-docs`, {
        input_key: params.case_name,
      });
    } catch (err) {
      console.error("Error processing document", err);
    }
  };

  async function deleteResources() {
    try {
      const response = await axios.delete(
        `${config.backendUrl}/api/v1/docs/delete-resource`,
        {
          data: {
            input_key: params.case_name,
          },
        },
      );

      if (response.status === 200) {
        console.log("success.");
        router.push("/dashboard/cases");
      }
    } catch {
      console.log("Sorry something went wrong");
    }
  }

  return (
    <div className="p-4 bg-gray-100 w-full">
      <div className="flex items-center gap-4 ">
        <div className="text-4xl font-medium py-4">{params.case_name}</div>
        <button onClick={() => deleteResources()}>
          <img
            src="/assets/dashboard/delete.png"
            alt=""
            className="h-6 w-auto"
          />
        </button>
      </div>

      <div className="flex justify-between mb-4">
        <ToggleTabs
          active={state.activeButton}
          onChange={(tab) =>
            dispatch({
              type: `TOGGLE_TO_${tab.toUpperCase()}` as Action["type"],
            })
          }
        />

        <div className="flex items-center space-x-4">
          <span
            onClick={() => setPreview("x")}
            className={`px-4 py-1 rounded-l-full border cursor-pointer ${
              preview === "x"
                ? "bg-sideBarGradient text-white"
                : "bg-white text-blue-600"
            }`}
          >
            Original
          </span>
          {/* <div
            className="relative w-12 h-6 bg-gray-300 rounded-full cursor-pointer"
            onClick={() => setPreview(preview === "x" ? "y" : "x")}
          >
            <div
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                preview === "x" ? "translate-x-0" : "translate-x-6"
              }`}
            />
          </div> */}
          <span
            onClick={() => setPreview("y")}
            className={`px-4 py-1 rounded-r-full border cursor-pointer ${
              preview === "y"
                ? "bg-sideBarGradient text-white"
                : "bg-white text-blue-600"
            }`}
          >
            Preview
          </span>
        </div>
      </div>

      <div className="h-full">
        <div className="flex h-full  gap-8">
          {state.activeButton === "OUTLINE" ? (
            <div className="w-1/2 h-3/4">
              <DescriptionEditor
                docName={params.case_name}
                data={documentData}
                setData={setDocumentData}
                onSave={saveData}
                onProcess={processDocument}
              />
            </div>
          ) : (
            <div className="w-1/2 h-3/4">
              <Result caseName={params.case_name} setPageNum={setPageNum} />
            </div>
          )}

          <div className="w-1/2 h-3/4">
            <UploadedPdf
              key={pageNum}
              uploadedPdf={
                preview === "x"
                  ? (docUrl?.original_pdf ?? null)
                  : (docUrl?.masked_pdf ?? null)
              }
              page={pageNum}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
