/* eslint-disable @next/next/no-img-element */
"use client";
import config from "@/config/config";
import axios from "axios";
import Link from "next/link";
import React, { Fragment, useEffect, useReducer } from "react";
import { State, Action, Document } from "@/types/dashboard/dashboard";

// Define the initial state
const initialState: State = { activeButton: "Outline" };

// Define the reducer function
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
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await axios.get(
          `${config.backendUrl}/api/v1/document/documents/${params.case_name}`,
        );
        console.log(response.data);
        if (response.status === 200) {
          setDocuments(response.data);
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchDocuments();
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

        {state.activeButton === "Outline" ? (
          <>
            {/* Table */}
            <div className="w-full border border-gray-300">
              <div className="bg-gray-200 flex">
                <div className="p-2 w-1/12 border-l-0 border-r-0 text-buttonTextColor font-medium">
                  Order
                </div>
                <div className="p-2 w-3/12 border-l-0 border-r-0 text-buttonTextColor font-medium">
                  Document Name
                </div>
                <div className="p-2 w-2/12 border-l-0 border-r-0 text-buttonTextColor font-medium">
                  Document Type
                </div>
                <div className="p-2 w-6/12 border-l-0 border-r-0 text-buttonTextColor font-medium">
                  Summary
                </div>
              </div>

              {documents?.length !== 0 &&
                documents &&
                documents.map((caseItem, index) => (
                  <div
                    key={index}
                    className={`${
                      index % 2 !== 0 ? "bg-white" : ""
                    } flex text-buttonTextColor border-2 border-gray-100`}
                  >
                    <Link
                      href={`/dashboard/cases/${params.case_name}/documents/${caseItem.documentId}/document`}
                      className="flex w-full"
                    >
                      <div className="p-2 w-1/12 border-l-0 border-r-0">
                        {index + 1}
                      </div>
                      <div className="p-2 w-3/12 border-l-0 border-r-0">
                        {caseItem.documentName}
                      </div>
                      <div className="p-2 w-2/12 border-l-0 border-r-0">
                        {caseItem.documentType.join(", ")}
                      </div>
                      <div className="p-2 w-6/12 border-l-0 border-r-0">
                        {caseItem?.document_summary?.slice(0, 80)}...
                      </div>
                    </Link>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <Fragment>
            <div className="flex justify-center gap-8  w-full ">
              <div className="bg-white shadow-lg w-1/2 h-64 flex flex-col gap-4 rounded-lg p-6">
                <div className="text-lg font-medium">Your Uploads</div>
                <div className="flex gap-4  w-full justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img
                      src="/assets/dashboard/documents/documents.svg"
                      alt=""
                      className="h-8 w-auto"
                    />
                    <div>Belkshire.pdf</div>
                  </div>
                  <div>5.7 MB</div>
                </div>
              </div>
              <div className="bg-white shadow-lg w-1/2 h-64 gap-4 flex flex-col rounded-lg p-6">
                <div className="text-lg font-medium">Your downloads</div>
                <div className="flex gap-4  w-full justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img
                      src="/assets/dashboard/documents/documents.svg"
                      alt=""
                      className="h-8 w-auto"
                    />
                    <div>Belkshire.pdf</div>
                  </div>
                  <div>5.7 MB</div>
                  <div>
                    <img
                      src="/assets/dashboard/downloads.svg"
                      alt=""
                      className="h-8 w-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        )}
      </div>
    </Fragment>
  );
}
