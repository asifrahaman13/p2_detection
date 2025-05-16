/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";

import NotSelected from "@/app/components/NotSelected";
import UploadedPdf from "@/app/components/UploadedPdf";
import config from "@/config/config";
import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import { DocumentData, KeyPoint } from "@/types/dashboard/dashboard";

export default function Document({
  params,
}: {
  params: { case_name: string; documentId: string };
}) {
  const { case_name, documentId } = params;
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);

  function addEmptyKeyPoint(): void {
    setDocumentData((prev) => {
      if (!prev) return null;
      const newKeyPoint: KeyPoint = {
        title: "<empty>",
        description: "<empty>",
      };
      return {
        ...prev,
        key_points: [...prev.key_points, newKeyPoint], // Add new key point to the array
      };
    });
  }

  // Add an empty keyword search
  function addEmptyKeywordSearch(): void {
    setDocumentData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        keywordSearch: [...prev.keywordSearch, ""],
      };
    });
  }

  function handleKeyChange(
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ): void {
    setDocumentData((prevData) => {
      if (!prevData) return null;
      const newKeyPoints = prevData.key_points.map((item, i) =>
        i === idx ? { ...item, title: e.target.value } : item,
      );
      return {
        ...prevData,
        key_points: newKeyPoints,
      };
    });
  }

  function handleValueChange(
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ): void {
    setDocumentData((prevData) => {
      if (!prevData) return null;
      const newKeyPoints = prevData.key_points.map((item, i) =>
        i === idx ? { ...item, description: e.target.value } : item,
      );
      return {
        ...prevData,
        key_points: newKeyPoints,
      };
    });
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    fieldType: "key_points" | "keywordSearch",
    index: string,
  ): void {
    const newValue = e.target.value;

    setDocumentData((prevData) => {
      if (!prevData) return null;

      if (fieldType === "keywordSearch") {
        return {
          ...prevData,
          keywordSearch: prevData.keywordSearch.map((item, i) =>
            i.toString() === index ? newValue : item,
          ),
        };
      }

      return prevData;
    });
  }

  useEffect(() => {
    async function fetchIntiailDocument(path: string) {
      try {
        const response = await axios.post(
          `${config.backendUrl}/api/v1/document/document-info`,
          {
            pdf_name: case_name,
            documentName: path,
          },
        );
        if (response.status === 200) {
          setDocumentData(response.data);
        }
      } catch (e) {
        console.log(e);
        throw new Error("Error fetching document");
      }
    }

    fetchIntiailDocument(documentId);
  }, [case_name, documentId]);

  useEffect(() => {
    async function updatedocumentDetails() {
      try {
        const response = await axios.put(
          `${config.backendUrl}/api/v1/document/update-document-data`,
          documentData,
        );
        if (response.status === 200) {
          console.log("Document details updated successfully");
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (documentData !== null) {
      updatedocumentDetails();
    }
  }, [documentData]);

  return (
    <Fragment>
      <div className="w-full py-6">
        {documentData ? (
          <Fragment>
            <div className="flex justify-between px-6 ">
              <div className="w-[46%] shadow-xl bg-white flex flex-col rounded-lg">
                <div className="p-4">
                  <input
                    className="font-medium text-xl w-full text-black outline-none ring-0"
                    value={documentData.documentName}
                    onChange={(e) =>
                      setDocumentData((prevData) => {
                        if (!prevData) return null;
                        return {
                          ...prevData,
                          documentName: e.target.value,
                        };
                      })
                    }
                  />
                </div>
                {/* Document Type */}
                <div className="  rounded-xl p-6 flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <div className="text-xl font-medium">Document Type</div>
                    <button
                      onClick={() => {
                        setDocumentData((prevData) => {
                          if (!prevData) return null;
                          return {
                            ...prevData,
                            documentType: [...prevData.documentType, ""],
                          };
                        });
                      }}
                    >
                      <img src="/assets/dashboard/Circle Plus.svg" alt="" />
                    </button>
                  </div>

                  <div className="flex gap-2 p-1">
                    {documentData.documentType.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center bg-buttonsBackgound text-blue-700 font-medium rounded-2xl px-3 py-1 m-1"
                      >
                        <input
                          key={idx}
                          value={item}
                          size={Math.max(item.length - 5, 8)}
                          className="bg-transparent text-center focus:outline-none ring-0"
                          onChange={(e) => {
                            const newDocumentType =
                              documentData.documentType.map((docType, i) =>
                                i === idx ? e.target.value : docType,
                              );
                            setDocumentData((prevData) => {
                              if (!prevData) return null;
                              return {
                                ...prevData,
                                documentType: newDocumentType,
                              };
                            });
                          }}
                        />

                        <button
                          className=" text-blue-700 focus:outline-none"
                          onClick={() => {
                            const newDocumentType =
                              documentData.documentType.filter(
                                (_, i) => i !== idx,
                              );
                            setDocumentData((prevData) => {
                              if (!prevData) return null;
                              return {
                                ...prevData,
                                documentType: newDocumentType,
                              };
                            });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 flex flex-col gap-2">
                  <div className="text-xl font-medium">
                    Document summarization
                  </div>
                  <textarea
                    value={documentData?.document_summary}
                    onChange={(e) =>
                      setDocumentData((prevData) => {
                        if (!prevData) return null;
                        return {
                          ...prevData,
                          document_summary: e.target.value,
                        };
                      })
                    }
                    className=" rounded-md border-0 focus:outline-none focus:ring-0 hover:ring-0"
                    rows={documentData?.document_summary?.length / 30}
                  />
                </div>

                {/* Extracting Key Data Points */}
                <div className="bg-white p-6 flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <div className="text-xl font-medium">
                      Extracting Key Data Points
                    </div>
                    <button onClick={addEmptyKeyPoint}>
                      <img src="/assets/dashboard/Circle Plus.svg" alt="" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {documentData.key_points &&
                      documentData?.key_points.map((item, index) => (
                        <div className="flex gap-2 items-center" key={index}>
                          <input
                            className="bg-buttonsBackgound max-w-36 font-medium text-center text-buttonTextColor  py-1 rounded-md border-0 focus:outline-none focus:ring-0 hover:ring-0"
                            placeholder="Key"
                            value={item.title}
                            onChange={(e) => handleKeyChange(e, index)}
                          />
                          <input
                            className="bg-gray-100  py-1  max-w-36 rounded-md  text-center border-0 focus:outline-none focus:ring-0 hover:ring-0"
                            placeholder="Value"
                            value={item.description}
                            onChange={(e) => handleValueChange(e, index)}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Keyword Search */}
                <div className="bg-white rounded-xl p-6 flex flex-col gap-2">
                  <div className="flex  gap-2 items-center">
                    <div className="text-xl font-medium">Keyword search</div>
                    <button onClick={addEmptyKeywordSearch}>
                      <img src="/assets/dashboard/Circle Plus.svg" alt="" />
                    </button>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    {documentData?.keywordSearch?.map((keyword, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-buttonsBackgound text-blue-700 font-medium rounded-2xl px-3 py-1 m-1"
                      >
                        <input
                          className="bg-transparent text-center focus:outline-none ring-0"
                          key={index}
                          placeholder={keyword || "<empty>"}
                          type="text"
                          value={keyword}
                          size={Math.max(keyword.length - 5, 2)}
                          onChange={(e) =>
                            handleInputChange(
                              e,
                              "keywordSearch",
                              index.toString(),
                            )
                          }
                        />
                        <button
                          className=" text-blue-700 focus:outline-none"
                          onClick={() => {
                            const temp = documentData.keywordSearch.filter(
                              (_, i) => i !== index,
                            );
                            setDocumentData((prevData) => {
                              if (!prevData) return null;
                              return {
                                ...prevData,
                                keywordSearch: temp,
                              };
                            });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-[48%] flex justify-center">
                <div className="w-full">
                  <UploadedPdf uploadedPdf={documentData.presigned_url} />
                </div>
              </div>
            </div>
          </Fragment>
        ) : (
          <NotSelected message="Sorry No data found" />
        )}
      </div>
    </Fragment>
  );
}
