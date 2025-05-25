"use client";
import React, { useEffect, useState, useRef } from "react";
import { UploadedPdfInterface } from "@/types/dashboard/dashboard";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

const UploadedPdf = ({ uploadedPdf }: UploadedPdfInterface) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pageNum = useSelector((state: RootState) => state.logSlice.pageNum);

  useEffect(() => {
    if (uploadedPdf) {
      console.log("PDF URL is set...");
      setPdfUrl(`${uploadedPdf}#page=${pageNum}`);
    }
  }, [pageNum, uploadedPdf]);

  useEffect(() => {
    if (iframeRef.current && pdfUrl) {
      console.log("Changing page without reload...");
      iframeRef.current.src = `${uploadedPdf}#page=${pageNum}`;
    }
  }, [pageNum, pdfUrl, uploadedPdf]);

  return (
    <div className="w-full h-full">
      {pdfUrl && (
        <iframe ref={iframeRef} src={pdfUrl} className="h-full w-full">
          Your browser does not support PDFs.
        </iframe>
      )}
    </div>
  );
};

export default UploadedPdf;
