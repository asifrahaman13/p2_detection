"use client";
import DescriptionEditor from "@/components/DescriptionEditor";
import config from "@/config/config";
import { RootState } from "@/lib/store";
import { parseInputKey } from "@/utils/parseInputKey";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDocumentData as setDocumentDataAction } from "@/lib/features/docSlice";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/toasts/Toast";
import { States } from "@/constants/state";

export default function Page() {
  const doc = useSelector((state: RootState) => state.docSlice);
  const docName = doc.docName;
  const docData = useSelector((state: RootState) => state.docSlice.data);
  const dispatch = useDispatch();
  const { toast, showToast } = useToast();

  useEffect(() => {
    const inputKey = parseInputKey(docName);
    if (!inputKey) return;

    async function fetchData() {
      try {
        const res = await axios.post(
          `${config.backendUrl}/api/v1/docs/get-key-points`,
          {
            input_key: inputKey,
          },
        );
        if (res.status === 200) {
          dispatch(setDocumentDataAction(res.data));
        }
      } catch {
        showToast("Error fetching document information", States.ERROR);
      }
    }

    fetchData();
  }, [dispatch, docName, showToast]);

  async function saveData() {
    if (!docData) return;
    try {
      await axios.post(`${config.backendUrl}/api/v1/docs/save`, docData);
    } catch {
      showToast("Error saving document information", States.ERROR);
    }
  }

  async function processDocument() {
    try {
      await axios.post(`${config.backendUrl}/api/v1/docs/process-docs`, {
        input_key: docName,
      });
    } catch {
      showToast("Error processing document", "error");
    }
  }

  return (
    <React.Fragment>
      <div className="w-1/2 h-3/4">
        {toast && <Toast message={toast.message} type={toast.type} />}
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
