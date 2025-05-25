/* eslint-disable @next/next/no-img-element */
"use client";
import config from "@/config/config";
import axios from "axios";
import React, { useState } from "react";
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
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function processDocument() {
    try {
      setLoading(true);
      callBackFunction();
      triggerProcess();
      handleProcessLoad();
      const response = await axios.post(
        `${config.backendUrl}/api/v1/docs/process-docs`,
        {
          input_key: caseName,
        },
      );
      if (response.status === 200) {
        router.push(`/dashboard/cases/${caseName}`);
      }
      setLoading(false);
    } catch (error: unknown) {
      console.error("Error highlighting pdf", error);
    }
  }

  return (
    <div>
      <div className="bg-white rounded-md p-6 w-full gap-6 flex flex-col">
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
      </div>
    </div>
  );
};

export default Overview;
