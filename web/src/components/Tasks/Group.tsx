/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";

const Group = () => {
  const [documentOfInterest, setDocumentOfInterest] = useState<string[]>([]);

  const handleAddDocument = () => {
    setDocumentOfInterest((prev) => [...prev, "<empty>"]);
  };

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
            Select the type of data you wish to mask.
          </div>
        </div>
        <div className="border-2 border-gray-100"></div>
        <div className="text-lg font-medium">Key Data Extractions</div>

        {/* Document of Interest */}
        <div className="flex items-center gap-2">
          <div className="text-md font-medium">Types of Data</div>
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

        <div className="border-2 border-gray-100"></div>
      </div>
    </div>
  );
};

export default Group;
