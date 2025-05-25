"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config/config";
import { DocumentData } from "@/types/dashboard/dashboard";
import { parseInputKey } from "@/utils/parseInputKey";
import { setDocumentData as setDocumentDataAction } from "@/lib/features/docSlice";
import { useDispatch } from "react-redux";

export function useDocumentData(caseName: string) {
  const dispatch = useDispatch();
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);

  useEffect(() => {
    const inputKey = parseInputKey(caseName);
    if (!inputKey) return;

    const fetchData = async () => {
      try {
        const res = await axios.post(
          `${config.backendUrl}/api/v1/docs/get-key-points`,
          {
            input_key: inputKey,
          },
        );
        setDocumentData(res.data);
        dispatch(setDocumentDataAction(res.data));
      } catch (err) {
        console.error("Keypoints error:", err);
      }
    };

    fetchData();
  }, [caseName, dispatch]);

  return [documentData, setDocumentData] as const;
}
