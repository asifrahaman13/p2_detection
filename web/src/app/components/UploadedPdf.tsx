"use client";
import React, { useEffect, useState, useRef } from "react";
import { UploadedPdfInterface } from "@/types/dashboard/dashboard";

const UploadedPdf = ({ uploadedPdf, page = 1 }: UploadedPdfInterface) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (uploadedPdf) {
      console.log("PDF URL is set...");
      setPdfUrl(`${uploadedPdf}#page=${page}`);
    }
  }, [page, uploadedPdf]);

  useEffect(() => {
    if (iframeRef.current && pdfUrl) {
      console.log("Changing page without reload...");
      iframeRef.current.src = `${uploadedPdf}#page=${page}`;
    }
  }, [page, pdfUrl, uploadedPdf]);

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
