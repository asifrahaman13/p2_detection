/* eslint-disable @next/next/no-img-element */
"use client";
import config from "@/config/config";
import axios from "axios";
import React, { useEffect, useState } from "react";
import PDFButtons from "../ui/PDFButtons";
import PrimaryButton from "../ui/PrimaryButton";
import { useRouter } from "next/navigation";

const Overview = ({
  caseName,
  callBackFunction,
  triggerProcess,
  handleProcessLoad,
}: {
  caseName: string;
  callBackFunction: () => void;
  triggerProcess: () => void;
  handleProcessLoad: () => void;
}) => {
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
        console.error("Error highlighting pdf", error);
      }
    }

    if (keywords !== null) {
      updateKeywordChange();
    }
  }, [keywords]);

  const [keyWordSearchPages, setKeyWordSearchPages] = useState<{
    [key: string]: number[];
  }>({});

  const router = useRouter();

  async function processDocument() {
    try {
      setLoading(true);
      callBackFunction();
      triggerProcess();
      handleProcessLoad();
      const response = await axios.get(
        `${config.backendUrl}/api/v1/pdf/process-document/${caseName}`,
      );
      if (response.data && response.status === 200) {
        setKeyWordSearchPages(response.data.keyword_search_pages);
        router.push(`/dashboard/cases/${caseName}`);
      }
      setLoading(false);
    } catch (error: unknown) {
      console.error("Error highlighting pdf", error);
    }
  }

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

  return (
    <div>
      <div className="bg-white rounded-md p-6 w-full gap-6 flex flex-col">
        <div className="flex gap-2 items-center">
          <div className="text-md font-medium">Key Words to Highlight</div>
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

        <div className="border-2 border-gray-100"></div>
        <div className="w-full flex gap-4 justify-end">
          <PrimaryButton
            associatedFunction={() => {}}
            text="Back"
            loading={loading}
          />
          <PDFButtons
            associatedFunction={processDocument}
            text="Process Document"
            loading={loading}
          />
        </div>

        <div>
          <div className="flex flex-col gap-2 ">
            {keyWordSearchPages &&
              Object.keys(keyWordSearchPages).map((keyElement: string) => (
                <>
                  <div className="text-gray-700 text-lg font-medium">
                    Keyword: {keyElement}
                  </div>
                  <div className="text-gray-700 text-lg font-bold flex gap-4">
                    Pages:
                    {keyWordSearchPages[keyElement].map(
                      (page: number, idx: number) => (
                        <button
                          className="text-gray-700 text-sm font-bold"
                          key={idx}
                        >
                          {page}{" "}
                        </button>
                      ),
                    )}
                  </div>
                </>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
