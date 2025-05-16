/* eslint-disable @next/next/no-img-element */
"use client";
import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import config from "@/config/config";
import PDFButtons from "@/app/components/ui/PDFButtons";
import Keywords from "@/app/components/cases/Keywords";
import Grouping from "@/app/components/cases/Grouping";

export default function Tasks({
  params,
}: {
  params: { case_name: string; documentId: string };
}) {
  const { case_name } = params;
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setExcelFile(files[0]);
    }
  };

  useEffect(() => {
    async function fetchPdfs() {
      try {
        const response = await axios.get(
          `${config.backendUrl}/api/v1/user/pdfs/user`,
        );
        if (response.status === 200) {
          console.log(response.data);
        }
      } catch (e) {
        console.log(e);
      }
    }

    fetchPdfs();
  }, []);

  const excelHighlight = async () => {
    if (!excelFile) {
      alert("Please upload an Excel file.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("pdf_file", case_name);

    try {
      // Send the Excel file to the FastAPI backend
      const response = await axios.post(
        `${config.backendUrl}/api/v1/highlight/highlight-excel`,
        formData,
      );

      if (response.data && response.status === 200) {
        setPresignedUrl(response.data.presigned_url);
        console.log("Presigned URL:", response.data.presigned_url);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error uploading the file:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadKeywords() {
      try {
        const response = await axios.get(
          `${config.backendUrl}/api/v1/user/excel-keywords`,
        );

        console.log(response);
        if (response.status === 200) {
          setKeywords(response.data);
        }
      } catch (e) {
        console.log(e);
      }
    }

    loadKeywords();
  }, []);

  useEffect(() => {
    async function saveKeywords() {
      try {
        const response = await axios.put(
          `${config.backendUrl}/api/v1/user/update-excel-keywords`,
          {
            keywords,
          },
        );

        if (response.status === 200) {
          console.log("Keywords saved successfully");
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (keywords !== null) {
      saveKeywords();
    }
  }, [keywords]);

  return (
    <Fragment>
      <div className="flex flex-col bg-gray-100 w-full">
        <div className="p-8 py-12 flex flex-col gap-6 w-full">
          <Keywords pdfName={case_name} />
          <Grouping pdfName={case_name} />

          <div className="bg-white rounded-md p-6 gap-3 flex flex-col">
            <div className="flex gap-2">
              <div className="text-md font-medium">
                Highlight the rows in the excel based on the following key
                fields
              </div>
              <button
                onClick={() => {
                  setKeywords([...keywords, ""]);
                }}
              >
                <img src="/assets/dashboard/Circle Plus.svg" alt="" />
              </button>
            </div>
            <div className="flex gap-2 flex-wrap ">
              {keywords &&
                keywords?.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-buttonsBackgound text-blue-700 font-medium rounded-2xl px-3 py-1 m-1"
                  >
                    <input
                      className="bg-transparent text-center focus:outline-none ring-0"
                      value={keyword}
                      size={Math.max(keyword.length - 5, 2)}
                      onChange={(e) => {
                        const temp = [...keywords];
                        temp[index] = e.target.value;
                        setKeywords(temp);
                      }}
                    />
                    <button
                      className=" text-blue-700 focus:outline-none"
                      onClick={() => {
                        const temp = keywords.filter((_, i) => i !== index);
                        setKeywords(temp);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>
            <div className="w-full flex pt-8 justify-between">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className=" border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
              />

              <PDFButtons
                associatedFunction={excelHighlight}
                text="Submit"
                loading={loading}
              />
            </div>
            <div>
              {presignedUrl && (
                <div>
                  <a
                    href={presignedUrl}
                    target="_blank"
                    className="text-blue-500 border-b-2 border-blue-500"
                  >
                    Click here to download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
