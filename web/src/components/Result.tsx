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
            <div className="text-lg font-medium mb-4">Statistics</div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
              <div>
                <span className="font-medium">Total Time:</span>{" "}
                {result.stats.total_time.toFixed(2)}s
              </div>
              <div>
                <span className="font-medium">Total Words Extracted:</span>{" "}
                {result.stats.total_words_extracted}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Unique Words Extracted:</span>
                <ul className="list-disc ml-6 mt-1">
                  {result.stats.unique_words_extracted.map((word, index) => (
                    <li key={index}>{word}</li>
                  ))}
                </ul>
              </div>
              <div className="col-span-2">
                <span className="font-medium">Word Frequencies:</span>
                <ul className="ml-4 mt-1">
                  {Object.entries(result.stats.word_frequencies).map(
                    ([word, count], index) => (
                      <li key={index}>
                        <span className="font-mono">{word}</span>: {count}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="col-span-2">
                <span className="font-medium">Word Page Map:</span>
                <ul className="ml-4 mt-1">
                  {Object.entries(result.stats.word_page_map).map(
                    ([phrase, pages], index) => (
                      <li key={index}>
                        <span className="font-mono">{phrase}</span>: pages{" "}
                        {pages.join(", ")}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
              onClick={() => alert("Download Result")}
            >
              Download Result
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
