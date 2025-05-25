import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config/config";
import { PresignedUrl } from "@/types/dashboard/dashboard";
import { parseInputKey } from "@/utils/parseInputKey";

export function usePresignedUrl(caseName?: string) {
  const [docUrl, setDocUrl] = useState<PresignedUrl | null>(null);

  useEffect(() => {
    if (!caseName) {
      return;
    }
    const inputKey = parseInputKey(caseName);
    if (!inputKey) return;

    const fetchPresignedUrl = async () => {
      try {
        const response = await axios.post(
          `${config.backendUrl}/api/v1/docs/get-presigned-url`,
          {
            input_key: inputKey,
          },
        );
        setDocUrl(response.data);
      } catch (error) {
        console.error("Presigned URL error:", error);
      }
    };

    fetchPresignedUrl();
  }, [caseName]);

  return docUrl;
}
