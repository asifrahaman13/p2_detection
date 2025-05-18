import axios from "axios";
import config from "@/config/config";
import { useEffect, useState } from "react";

type RedactedFileUploadResponse = {
  message: string;
  s3_path: string;
  stats: {
    total_time: number;
    total_words_extracted: number;
    unique_words_extracted: string[];
    word_frequencies: Record<string, number>;
    word_page_map: Record<string, number[]>;
  };
};

export default function Result({ caseName }: { caseName: string }) {
  const [result, setResult] = useState<RedactedFileUploadResponse | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await axios.post(
          `${config.backendUrl}/api/v1/docs/results`,
          { input_key: caseName },
        );
        if (response.status === 200) {
          setResult(response.data.results);
        } else {
          console.error("Error fetching results", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching results", error);
      }
    }

    fetchResults();
  }, [caseName]);

  return (
    <div className=" bg-gray-50 overflow-scroll h-full">
      {!result ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col gap-4 text-sm text-gray-800">
              <div>
                <div className="flex justify-end">
                  <button
                    className="bg-blue-800 hover:bg-blue-700 font-medium text-white px-6 py-2 rounded-md transition"
                    onClick={() => {
                      if (result?.stats) {
                        const jsonBlob = new Blob(
                          [JSON.stringify(result.stats, null, 2)],
                          {
                            type: "application/json",
                          },
                        );
                        const url = URL.createObjectURL(jsonBlob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${caseName}_stats.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                  >
                    Download Result
                  </button>
                </div>
              </div>
              <div className="flex justify-between w-full gap-2">
                <div className="text-2xl  font-medium bg-green-200 text-green-600 px-4 py-2 rounded-lg">
                  <span>Total Time:</span> {result.stats.total_time.toFixed(2)}s
                </div>
                <div className="text-2xl  font-medium bg-green-200 text-green-600 px-4 py-2 rounded-lg">
                  <span>Total Words Extracted:</span>{" "}
                  {result.stats.total_words_extracted}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-semibold">Unique Words Extracted:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.stats.unique_words_extracted.map((word, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded shadow-sm inline-block"
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-semibold">Word Frequencies:</span>
                <div className="">
                  {Object.entries(result.stats.word_frequencies).map(
                    ([word, count], index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="font-mono">{word}</span>:
                        <span className="bg-blue-50 px-2  text-blue-800 rounded-lg">
                          {" "}
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-medium">Word Page Map:</div>
                <div className="">
                  {Object.entries(result.stats.word_page_map).map(
                    ([phrase, pages], index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <div className=" ">{phrase}</div>:{" "}
                        <div className="px-2 rounded-lg flex flex-wrap gap-2">
                          {pages.map((item, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-50 text-blue-700 px-2 py-0.5 text-sm rounded-full"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
