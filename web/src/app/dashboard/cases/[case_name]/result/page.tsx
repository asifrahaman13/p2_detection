"use client";
import Result from "@/components/Result";
import { RootState } from "@/lib/store";

import React from "react";
import { useSelector } from "react-redux";

export default function Page() {
  const doc = useSelector((state: RootState) => state.docSlice);
  const docName = doc.docName;

  return (
    <React.Fragment>
      <div className="w-1/2 h-3/4">
        <Result caseName={docName} />
      </div>
    </React.Fragment>
  );
}
