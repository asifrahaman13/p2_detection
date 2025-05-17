import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config/config";
import { PresignedUrl } from "@/types/dashboard/dashboard";
import { parseInputKey } from "@/utils/parseInputKey";

export function usePresignedUrl(caseName: string) {
  const [docUrl, setDocUrl] = useState<PresignedUrl | null>(null);

  useEffect(() => {
    const inputKey = parseInputKey(caseName);
    if (!inputKey) return;

    axios
      .post(`${config.backendUrl}/api/v1/pdf/get-presigned-url`, {
        input_key: inputKey,
      })
      .then((res) => setDocUrl(res.data))
      .catch((err) => console.error("Presigned URL error:", err));
  }, [caseName]);

  return docUrl;
}
