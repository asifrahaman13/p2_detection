"use client";
import DescriptionEditor from "@/components/DescriptionEditor";
import config from "@/config/config";
import { RootState } from "@/lib/store";
import { parseInputKey } from "@/utils/parseInputKey";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDocumentData as setDocumentDataAction } from "@/lib/features/docSlice";

export default function Page() {
  const doc = useSelector((state: RootState) => state.docSlice);
  const docName = doc.docName;
  const docData = useSelector((state: RootState) => state.docSlice.data);
  const dispatch = useDispatch();

  useEffect(() => {
    const inputKey = parseInputKey(docName);
    if (!inputKey) return;

    const fetchData = async () => {
      try {
        const res = await axios.post(
          `${config.backendUrl}/api/v1/docs/get-key-points`,
          {
            input_key: inputKey,
          }
        );
        dispatch(setDocumentDataAction(res.data));
      } catch (err) {
        console.error("Keypoints error:", err);
      }
    };

    fetchData();
  }, [dispatch, docName]);

  async function saveData() {
    if (!docData) return;
    try {
      await axios.post(`${config.backendUrl}/api/v1/docs/save`, docData);
    } catch (err) {
      console.error("Error saving data", err);
    }
  }

  async function processDocument() {
    try {
      await axios.post(`${config.backendUrl}/api/v1/docs/process-docs`, {
        input_key: docName,
      });
    } catch (err) {
      console.error("Error processing document", err);
    }
  }

  return (
    <React.Fragment>
      <div className="w-1/2 h-3/4">
        <DescriptionEditor
          docName={docName}
          data={docData}
          onSave={saveData}
          onProcess={processDocument}
        />
      </div>
    </React.Fragment>
  );
}
