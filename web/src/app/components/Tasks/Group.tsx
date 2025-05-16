/* eslint-disable @next/next/no-img-element */
"use client";
import config from "@/config/config";
import { RootState } from "@/lib/store";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

const Group = () => {
  // States for dynamically adding/editing elements
  const [documentOfInterest, setDocumentOfInterest] = useState<string[]>([]);
  const [dateOfinterest, setDateOfInterest] = useState<string[]>([]);
  const [yearOfInterest, setYearOfInterest] = useState<string[]>([]);

  const selectedDocuments = useSelector(
    (state: RootState) => state.pdfSelection,
  );

  // Flag to prevent unnecessary updates after initial fetch
  const isInitialLoad = useRef(true);
  // const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchDocumentInterests() {
      try {
        const response = await axios.get(
          `${config.backendUrl}/api/v1/document/document-orderings`,
        );
        if (response.status === 200) {
          const data = response.data.orderings;
          setDocumentOfInterest(data.documentOfInterest);
          setDateOfInterest(data.datesOfInterest);
          setYearOfInterest(data.yearsOfInterest);
          // Mark the initial load as completed after data is fetched
          isInitialLoad.current = false;
        }
      } catch (error: unknown) {
        console.error("Error fetching document interests", error);
      }
    }
    fetchDocumentInterests();
  }, [selectedDocuments]);

  useEffect(() => {
    // Skip the first update during the initial fetch
    if (isInitialLoad.current) return;

    async function updateDocumentInterests() {
      try {
        const response = await axios.put(
          `${config.backendUrl}/api/v1/document/document-orderings`,
          {
            documentOfInterest: documentOfInterest,
            datesOfInterest: dateOfinterest,
            yearsOfInterest: yearOfInterest,
          },
        );
        if (response.status === 200) {
          console.log("Document interests updated successfully");
        }
      } catch (error: unknown) {
        console.error("Error updating document interests", error);
      }
    }

    updateDocumentInterests();
  }, [documentOfInterest, dateOfinterest, yearOfInterest]);

  // Handlers to add an "<empty>" element
  const handleAddDocument = () => {
    setDocumentOfInterest((prev) => [...prev, "<empty>"]);
  };

  const handleAddDate = () => {
    setDateOfInterest((prev) => [...prev, "<empty>"]);
  };

  const handleAddYear = () => {
    setYearOfInterest((prev) => [...prev, "<empty>"]);
  };

  // Function to update elements
  const handleUpdate = (
    index: number,
    value: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setState((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  return (
    <div>
      <div className="bg-white p-6 w-full gap-4 flex flex-col">
        <div className="flex flex-col gap-4">
          <div className="text-md font-semibold">Define filters</div>
          <div className="text-sm">
            Automatically have your document analyzed, grouped, and sorted with
            your preferred settings.{" "}
          </div>
        </div>
        <div className="border-2 border-gray-100"></div>
        <div className="text-lg font-medium">Key Data Extractions</div>

        {/* Document of Interest */}
        <div className="flex items-center gap-2">
          <div className="text-md font-medium">Types of document</div>
          <button onClick={handleAddDocument}>
            <img src="/assets/dashboard/Circle Plus.svg" alt="" />
          </button>
        </div>
        <div className="flex gap-2 flex-wrap w-full">
          {documentOfInterest.map((doc, index) => (
            <div
              key={index}
              className="flex items-center bg-buttonsBackgound text-blue-700 font-medium  rounded-2xl px-3 py-1 m-1"
            >
              <input
                value={doc}
                onChange={(e) =>
                  handleUpdate(index, e.target.value, setDocumentOfInterest)
                }
                size={Math.max(doc.length - 5, 2)}
                className="bg-transparent text-center focus:outline-none ring-0"
              />
              <button
                className="ml-2 text-blue-700  focus:outline-none"
                onClick={() => {
                  const temp = documentOfInterest.filter((_, i) => i !== index);
                  setDocumentOfInterest(temp);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Dates of Interest */}
        <div className="flex items-center gap-2">
          <div className="text-md font-medium">Dates of interests</div>
          <button onClick={handleAddDate}>
            <img src="/assets/dashboard/Circle Plus.svg" alt="" />
          </button>
        </div>
        <div className="flex gap-2 flex-wrap w-full">
          {dateOfinterest.map((date, index) => (
            <div
              key={index}
              className="flex items-center bg-buttonsBackgound font-medium text-blue-700  rounded-2xl px-3 py-1 m-1"
            >
              <input
                value={date}
                size={Math.max(date.length - 5, 2)}
                onChange={(e) =>
                  handleUpdate(index, e.target.value, setDateOfInterest)
                }
                className="bg-transparent text-center focus:outline-none ring-0"
              />
              <button
                className="ml-2 text-blue-700  focus:outline-none"
                onClick={() => {
                  const temp = dateOfinterest.filter((_, i) => i !== index);
                  setDateOfInterest(temp);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Years of Interest */}
        <div className="flex items-center gap-2">
          <div className="text-md font-medium">Years of interests</div>
          <button onClick={handleAddYear}>
            <img src="/assets/dashboard/Circle Plus.svg" alt="" />
          </button>
        </div>
        <div className="flex gap-2 flex-wrap w-full">
          {yearOfInterest.map((year, index) => (
            <div
              key={index}
              className="flex items-center bg-buttonsBackgound font-medium text-blue-700  rounded-2xl px-3 py-1 m-1"
            >
              <input
                value={year}
                size={Math.max(year.length - 5, 2)}
                onChange={(e) =>
                  handleUpdate(index, e.target.value, setYearOfInterest)
                }
                className="bg-transparent text-center focus:outline-none ring-0"
              />
              <button
                className="ml-2 text-blue-700  focus:outline-none"
                onClick={() => {
                  const temp = yearOfInterest.filter((_, i) => i !== index);
                  setYearOfInterest(temp);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* <div className="w-full flex justify-end">
          <PDFButtons
            associatedFunction={handleOrganizePdf}
            text="Submit"
            loading={loading}
          />
        </div> */}

        <div className="border-2 border-gray-100"></div>

        {/* <div>
          {presignedUrl && (
            <div>
              <a
                href={presignedUrl}
                target="_blank"
                className="text-blue-500 border-b-2 border-blue-500"
              >
                Click here to view/download
              </a>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default Group;
