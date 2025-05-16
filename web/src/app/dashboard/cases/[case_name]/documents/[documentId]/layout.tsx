/* eslint-disable @next/next/no-img-element */
"use client";
import { Fragment } from "react";
import { useReducer } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface State {
  activeTab: "list" | "document" | "file";
}

// Define the shape of the actions
type Action =
  | { type: "LIST_TAB" }
  | { type: "DOCUMENT_TAB" }
  | { type: "FILE_TAB" };

// Define the initial state
const initialState: State = { activeTab: "document" };

// Reducer function with state and action types
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "LIST_TAB":
      return { activeTab: "list" };
    case "DOCUMENT_TAB":
      return { activeTab: "document" };
    case "FILE_TAB":
      return { activeTab: "file" };
    default:
      return state;
  }
};

export default function Page({
  params,
  children,
}: {
  params: { documentId: string; case_name: string };
  children: React.ReactNode;
}) {
  const { documentId, case_name } = params;
  const router = useRouter();

  const [state, dispatch] = useReducer(reducer, initialState);

  // Helper to determine the correct image source
  const getIconSrc = (tab: "list" | "document" | "file") => {
    switch (tab) {
      case "list":
        return state.activeTab === "list"
          ? "/assets/dashboard/documents/highlightlist.svg"
          : "/assets/dashboard/documents/list.svg";
      case "document":
        return state.activeTab === "document"
          ? "/assets/dashboard/documents/highlightedfile.svg"
          : "/assets/dashboard/documents/File Description.svg";
      case "file":
        return state.activeTab === "file"
          ? "/assets/dashboard/documents/highlightoverview.svg"
          : "/assets/dashboard/documents/File Export.svg";
      default:
        return "";
    }
  };

  const handleTabChange = (tab: Action["type"], path: string) => {
    dispatch({ type: tab });
    router.push(path); // Navigate to the new route
  };

  return (
    <Fragment>
      <div className="flex flex-col overflow-y-scroll w-full no-scrollbar">
        <div className="px-4 flex gap-2 items-center">
          <Link href={`/dashboard/cases/${params.case_name}`}>
            <img src="/assets/dashboard/documents/Action Icon.svg" alt="" />
          </Link>
          <div className="text-buttonTextColor font-semibold">
            {params.case_name}
          </div>
        </div>
        <div className="flex flex-row w-full">
          <div className="flex flex-col gap-4 py-16 px-4">
            {/* Buttons to switch tabs */}
            <button
              onClick={() =>
                handleTabChange(
                  "LIST_TAB",
                  `/dashboard/cases/${case_name}/documents/${documentId}/all-documents`,
                )
              }
            >
              <img src={getIconSrc("list")} alt="List Tab" />
            </button>
            <button
              onClick={() =>
                handleTabChange(
                  "DOCUMENT_TAB",
                  `/dashboard/cases/${case_name}/documents/${documentId}/document`,
                )
              }
            >
              <img src={getIconSrc("document")} alt="Document Tab" />
            </button>
            <button
              onClick={() =>
                handleTabChange(
                  "FILE_TAB",
                  `/dashboard/cases/${case_name}/documents/${documentId}/process`,
                )
              }
            >
              <img src={getIconSrc("file")} alt="File Tab" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </Fragment>
  );
}
