/* eslint-disable @next/next/no-img-element */
"use client";
import React, { Fragment } from "react";
import Overview from "@/components/Tasks/Overview";
import Group from "@/components/Tasks/Group";

export default function DefineComponent({
  case_name,
  callbackFunction,
  triggerProcess,
}: {
  case_name: string;
  callbackFunction: () => void;
  triggerProcess: () => void;
}) {
  const [processLoad, setProcessLoad] = React.useState<boolean>(false);

  function handleProcessLoad() {
    setProcessLoad(true);
  }

  return (
    <Fragment>
      <div className="flex flex-col h-full w-full items-center">
        <div className=" bg-white shadow-md rounded-md flex h-1/2 flex-col w-1/2">
          {processLoad ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-blue-500"></span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {" "}
              <Group />
              <Overview
                caseName={case_name}
                callBackFunction={callbackFunction}
                triggerProcess={triggerProcess}
                handleProcessLoad={handleProcessLoad}
              />
            </>
          )}
        </div>
      </div>
    </Fragment>
  );
}
