/* eslint-disable @next/next/no-img-element */
"use client";

import NotSelected from "@/app/components/NotSelected";
import PDFButtons from "@/app/components/ui/PDFButtons";

import UploadedPdf from "@/app/components/UploadedPdf";
import config from "@/config/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";

type DocumentItem = {
  documentName: string;
  connected_pages: number[];
  documentId: string;
};

export default function DocumentList({
  params,
}: {
  params: { case_name: string; documentId: string };
}) {
  const [documentItems, setDocumentItems] = React.useState<
    DocumentItem[] | null
  >(null);
  const [presignedUrl, setPresignedUrl] = React.useState();
  const { case_name } = params;

  // Use refs to track dragged elements
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);
  const sourceDocumentIndex = React.useRef<number | null>(null); // Track the source document
  const sourcePageIndex = React.useRef<number | null>(null); // Track the source page

  // Handle dragging a page
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    docIndex: number,
    pageIndex: number,
  ) => {
    dragItem.current = pageIndex;
    sourceDocumentIndex.current = docIndex;
    sourcePageIndex.current = pageIndex;
  };

  const [loading, setLoading] = useState(false);
  // Handle dropping a page into a new document or rearranging within the same document
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, docIndex: number) => {
    const draggedPageIndex = dragItem.current;
    if (documentItems && draggedPageIndex !== null) {
      // If dropped in the same document
      if (sourceDocumentIndex.current === docIndex) {
        const newDocumentItems = [...documentItems];
        const draggedPage = newDocumentItems[docIndex].connected_pages.splice(
          draggedPageIndex,
          1,
        )[0];
        newDocumentItems[docIndex].connected_pages.splice(
          dragOverItem.current!,
          0,
          draggedPage,
        );
        setDocumentItems(newDocumentItems);
      } else if (sourceDocumentIndex.current !== null) {
        // Moving the page from source document to target document
        const newDocumentItems = [...documentItems];
        const movedPage = newDocumentItems[
          sourceDocumentIndex.current
        ].connected_pages.splice(draggedPageIndex, 1)[0];
        newDocumentItems[docIndex].connected_pages.splice(
          dragOverItem.current!,
          0,
          movedPage,
        );
        setDocumentItems(newDocumentItems);
      }

      // Reset references
      dragItem.current = null;
      sourceDocumentIndex.current = null;
      sourcePageIndex.current = null;
      dragOverItem.current = null;
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const targetIndex = e.currentTarget.getAttribute("data-index");
    dragOverItem.current = targetIndex ? Number(targetIndex) : null;
    console.log(documentItems);
  };

  useEffect(() => {
    async function fetchConnectedPages(path: string) {
      try {
        const response = await axios.get(
          `${config.backendUrl}/api/v1/pdf/find-connected-pages/${path}`,
        );
        console.log("##########################", response.data);
        if (response.status === 200) {
          setDocumentItems(response.data.pages);
          setPresignedUrl(response.data.presignedUrl);
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetchConnectedPages(case_name);
  }, [case_name]);

  useEffect(() => {
    async function updateConnectedPages() {
      const updatedPages = documentItems?.map((item) => {
        return {
          documentName: item.documentName,
          connected_pages: item.connected_pages,
          documentId: item.documentId,
        };
      });
      try {
        const response = await axios.put(
          `${config.backendUrl}/api/v1/pdf/update-connected-pages`,
          {
            pdf_name: case_name,
            pages: updatedPages,
          },
        );
        if (response.status === 200) {
          console.log("Pages updated successfully");
        }
      } catch (e) {
        console.log("Error updating pages", e);
      }
    }

    if (case_name && documentItems) {
      updateConnectedPages();
    }
  }, [case_name, documentItems]);

  const handleDocumentNameChange = (index: number, newValue: string) => {
    const updatedDocumentItems = [...documentItems!];
    updatedDocumentItems[index].documentName = newValue;
    setDocumentItems(updatedDocumentItems);
  };

  const [pageNum, setPageNum] = useState(1);

  const handleSplitDocument = (docIndex: number, pageIndex: number) => {
    if (!documentItems) return;

    const newDocumentItems = [...documentItems];
    const currentDocument = newDocumentItems[docIndex];

    // Split the pages into two groups
    const pagesBefore = currentDocument.connected_pages.slice(0, pageIndex + 1);
    const pagesAfter = currentDocument.connected_pages.slice(pageIndex + 1);

    // Update the original document with the first group of pages
    newDocumentItems[docIndex].connected_pages = pagesBefore;

    // Create a new document with the second group of pages and an empty title
    const newDocument: DocumentItem = {
      documentName: "<empty>", // Default title for the new document
      connected_pages: pagesAfter,
      documentId: `new-${Date.now()}`, // Generate a new unique ID
    };

    // Insert the new document after the current one
    newDocumentItems.splice(docIndex + 1, 0, newDocument);

    setDocumentItems(newDocumentItems);
    console.log(newDocumentItems);
  };

  async function processChanges() {
    console.log("Processing changes");
    try {
      setLoading(true);
      console.log(case_name, documentItems);
      const response = await axios.put(
        `${config.backendUrl}/api/v1/pdf/process-updated-connected-documents`,
        {
          pdf_name: case_name,
          pages: documentItems,
        },
      );
      console.log(response);
      if (response.status === 200) {
        console.log("Changes processed successfully");
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  const router = useRouter();

  function handleOverviewRouterChange(documentId: string) {
    router.push(
      `/dashboard/cases/${case_name}/documents/${documentId}/document`,
    );
  }

  return (
    <Fragment>
      <div className="flex flex-col w-full">
        <div className="w-full xl:px-12 text-end">
          <PDFButtons
            associatedFunction={processChanges}
            text="Process Changes"
            loading={loading}
          />
        </div>
        {documentItems ? (
          <Fragment>
            <div className="app py-6 px-6 justify-between  flex h-full w-full">
              <div className="w-[46%] shadow-lg rounded-md h-full overflow-y-scroll no-scrollbar">
                <div className="list-sort shadow-lg bg-white  rounded-xl">
                  <div className="px-6 font-semibold text-lg py-2">
                    {case_name}
                  </div>
                  {documentItems?.map((item, docIndex) => (
                    <div key={docIndex} className="document p-4">
                      <div className="flex gap-2 ">
                        <div className="font-semibold">{docIndex + 1}.</div>
                        <input
                          type="text"
                          className="text-md font-semibold w-full border-0 focus:outline-none focus:ring-0 hover:ring-0"
                          value={item.documentName}
                          onChange={(e) =>
                            handleDocumentNameChange(docIndex, e.target.value)
                          }
                        />
                        <button
                          onClick={() => {
                            handleOverviewRouterChange(item.documentId);
                          }}
                          className="text-blue-600 text-sm font-medium"
                        >
                          Overview
                        </button>
                      </div>
                      <div className="page mt-2" onDragOver={handleDragOver}>
                        {item.connected_pages.map((page, pageIndex) => (
                          <Fragment key={pageIndex}>
                            <div
                              key={pageIndex}
                              className="flex items-center group cursor-grab"
                              onDrop={(e) => handleDrop(e, docIndex)}
                            >
                              <div className="hidden group-hover:block">
                                <img
                                  src="/assets/dashboard/Action Icon.svg"
                                  alt="Action Icon"
                                  draggable
                                  onDragStart={(e) =>
                                    handleDragStart(e, docIndex, pageIndex)
                                  }
                                />
                              </div>
                              <button
                                data-index={pageIndex.toString()}
                                className="page-item font-medium px-2 my-2"
                                onClick={() => setPageNum(page)}
                              >
                                {page}
                              </button>
                            </div>

                            {pageIndex < item.connected_pages.length - 1 && (
                              <div
                                className="relative flex justify-center items-center my-2 cursor-pointer group"
                                onClick={() =>
                                  handleSplitDocument(docIndex, pageIndex)
                                }
                              >
                                <button className="absolute  w-full text-sm text-gray-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="relative flex items-center w-full bg-white justify-center">
                                    {/* Horizontal line on the left */}
                                    <div className="flex-grow border-t border-blue-300"></div>

                                    {/* Center icon */}
                                    <div className="mx-2 p-1 rounded-full bg-blue-100">
                                      <img
                                        src="/assets/dashboard/Icon.svg"
                                        alt="Insert"
                                        className="h-4 w-4"
                                      />
                                    </div>

                                    {/* Horizontal line on the right */}
                                    <div className="flex-grow border-t border-blue-300"></div>
                                  </div>
                                </button>
                              </div>
                            )}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-[48%] flex  h-full justify-center">
                <div className="w-full h-full">
                  <UploadedPdf
                    uploadedPdf={presignedUrl || ""}
                    page={pageNum}
                    key={pageNum}
                  />
                </div>
              </div>
            </div>
          </Fragment>
        ) : (
          <div className="w-full h-full">
            <NotSelected message="No PDF or document selected" />
          </div>
        )}
      </div>
    </Fragment>
  );
}
