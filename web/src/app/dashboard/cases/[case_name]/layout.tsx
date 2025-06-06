/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import UploadedPdf from "@/components/UploadedPdf";
import ToggleTabs from "@/components/ToggleTabs";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";

import axios from "axios";
import config from "@/config/config";
import { useRouter } from "next/navigation";

import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setLogs } from "@/lib/features/logSlice";
import { updatePdfName } from "@/lib/features/docSlice";
import { RootState } from "@/lib/store";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const doc = useSelector((state: RootState) => state.docSlice);
  const [preview, setPreview] = useState("x");
  const docUrl = usePresignedUrl(doc?.docName);

  useEffect(() => {
    const docPath = pathname.split("/").at(3) || "";
    dispatch(updatePdfName(docPath));
  }, [dispatch, pathname]);

  async function deleteResources() {
    try {
      const response = await axios.delete(
        `${config.backendUrl}/api/v1/docs/delete-resource`,
        {
          data: {
            input_key: doc.docName,
          },
        },
      );

      if (response.status === 200) {
        router.push(`/dashboard/cases/${doc.docName}/outline`);
      }
    } catch {
      console.log("Sorry something went wrong");
    }
  }

  useEffect(() => {
    async function fetchAllLogs() {
      try {
        console.log("My doc name", doc.docName);
        const response = await axios.get(
          `${config.backendUrl}/api/v1/docs/logs/${doc.docName}`,
        );

        if (response.status === 200) {
          console.log("The logs");
          console.log(response.data.log);
          dispatch(setLogs(response.data.log));
        }
      } catch {
        console.log("Sorry something went wrong");
      }
    }
    fetchAllLogs();
  }, [dispatch, doc]);

  return (
    <div className="p-4 bg-gray-100 w-full">
      <div className="flex items-center gap-4 ">
        <div className="text-4xl font-medium py-4">{doc?.docName}</div>
        <button onClick={() => deleteResources()}>
          <img
            src="/assets/dashboard/delete.png"
            alt=""
            className="h-6 w-auto"
          />
        </button>
      </div>

      <div className="flex justify-between mb-4">
        <ToggleTabs docName={doc?.docName} />

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
          {children}
          <div className="w-1/2 h-3/4">
            <UploadedPdf
              uploadedPdf={
                preview === "x"
                  ? (docUrl?.original_pdf ?? null)
                  : (docUrl?.masked_pdf ?? null)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
