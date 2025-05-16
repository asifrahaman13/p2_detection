/* eslint-disable @next/next/no-img-element */
"use client";
import config from "@/config/config";
import axios from "axios";
import React, { useEffect, useState } from "react";
import PDFButtons from "@/app/components/ui/PDFButtons";

export default function Keywords({ pdfName }: { pdfName: string }) {
  const [keywords, setKeywords] = useState<string[]>([]);

  // Function to add empty list
  const addEmptyList = () => {
    setKeywords([...keywords, "<empty>"]);
  };

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function updateKeywordChange() {
      try {
        const response = await axios.put(
          `${config.backendUrl}/api/v1/document/update-keywords`,
          {
            keywords: keywords,
          },
        );
        if (response.data && response.status === 200) {
          console.log("Keywords updated successfully");
        }
      } catch (error: unknown) {
        console.log("Error highlighting pdf", error);
      }
    }

    if (keywords !== null) {
      updateKeywordChange();
    }
  }, [keywords]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${config.backendUrl}/api/v1/highlight/highlight-pdf`,
        {
          search_text: keywords,
          file_key: `highlighted_pdfs/${pdfName}`,
        },
      );
      if (response.data && response.status === 200) {
        setPresignedUrl(response.data.presigned_url);

        // Trigger download of keyword search pages as .txt file
        downloadKeyWordSearchPagesAsText(
          response.data.keyword_search_pages,
        );
      }
      setLoading(false);
    } catch (error: unknown) {
      console.error("Error highlighting pdf", error);
      setLoading(false);
    }
  };

  const downloadKeyWordSearchPagesAsText = (keyWordSearchPages: {
    [key: string]: number[];
  }) => {
    // Convert keyWordSearchPages to a string format
    let pagesText = "";
    for (const keyword in keyWordSearchPages) {
      pagesText += `${keyword}: ${keyWordSearchPages[keyword].join(", ")}\n`;
    }

    // Create a Blob from the pages text
    const blob = new Blob([pagesText], { type: "text/plain" });

    // Create a link element
    const link = document.createElement("a");

    // Set the href to the blob URL
    link.href = URL.createObjectURL(blob);
    link.download = "keyword_search_pages.txt"; // Set the file name

    // Append to the body
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up and remove the link
    document.body.removeChild(link);
  };

  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKeywords() {
      try {
        const response = await axios.get(
          `${config.backendUrl}/api/v1/document/keywords`,
        );
        if (response.status === 200) {
          setKeywords(response.data.keywords);
        }
      } catch (error: unknown) {
        console.error("Error fetching keywords", error);
      }
    }
    fetchKeywords();
  }, []);

  const downloadFileFromPresignedUrl = async (
    presignedUrl: string,
    fileName: string,
  ) => {
    try {
      const response = await axios.get(presignedUrl, {
        responseType: "blob",
      });

      const blobUrl = URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setPresignedUrl(null);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-md p-6 w-full gap-6 flex flex-col">
        <div className="flex gap-2 items-center">
          <div className="text-md font-medium">
            Generate the PDF pages with all of the key words highlighted.{" "}
          </div>
          <button onClick={addEmptyList}>
            <img src="/assets/dashboard/Circle Plus.svg" alt="" />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {keywords.map((keyword, index) => (
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

        <div className="w-full flex gap-4 justify-end">
          <PDFButtons
            associatedFunction={handleSubmit}
            text="Process"
            loading={loading}
          />

          {presignedUrl && (
            <div>
              <PDFButtons
                associatedFunction={() =>
                  downloadFileFromPresignedUrl(presignedUrl, "highlighted.pdf")
                }
                text="Download PDF"
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
