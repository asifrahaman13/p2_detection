import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config/config";
import { DocumentData } from "@/types/dashboard/dashboard";
import { parseInputKey } from "@/utils/parseInputKey";

export function useDocumentData(caseName: string) {
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);

  useEffect(() => {
    const inputKey = parseInputKey(caseName);
    if (!inputKey) return;

    axios
      .post(`${config.backendUrl}/api/v1/docs/get-key-points`, {
        input_key: inputKey,
      })
      .then((res) => setDocumentData(res.data))
      .catch((err) => console.error("Keypoints error:", err));
  }, [caseName]);

  return [documentData, setDocumentData] as const;
}
