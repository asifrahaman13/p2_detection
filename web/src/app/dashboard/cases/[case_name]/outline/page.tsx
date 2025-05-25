"use client";
import DescriptionEditor from "@/components/DescriptionEditor";
import config from "@/config/config";
import { useDocumentData } from "@/hooks/useDocumentData";
import { RootState } from "@/lib/store";
import axios from "axios";
import React from "react";
import { useSelector } from "react-redux";

export default function Page() {
  const doc = useSelector((state: RootState) => state.docSlice);
  const docName = doc.docName;
  const docData = useSelector((state: RootState) => state.docSlice.data);
  console.log("My slice", docData);
  const [documentData, setDocumentData] = useDocumentData(docName);

  async function saveData() {
    if (!documentData) return;
    try {
      await axios.post(`${config.backendUrl}/api/v1/docs/save`, documentData);
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
          setData={setDocumentData}
          onSave={saveData}
          onProcess={processDocument}
        />
      </div>
    </React.Fragment>
  );
}
