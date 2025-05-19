/* eslint-disable @next/next/no-img-element */
"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import Overview from "@/components/Tasks/Overview";
import Group from "@/components/Tasks/Group";
import config from "@/config/config";

type ProgressMessage = {
  status: string;
  timestamp: number;
};

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
  const [messages, setMessages] = useState<ProgressMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${config.websocketUrl}/api/ws/progress/${case_name}`,
    );
    if (!wsRef.current) {
      wsRef.current = ws;
    }

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      setMessages((prev) => [...prev, parsedData]);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [case_name]);

  return (
    <Fragment>
      <div className="flex flex-col h-full w-full items-center">
        <div className=" bg-white shadow-md rounded-md flex h-1/2 flex-col w-1/2">
          {processLoad ? (
            <div className="flex flex-col gap-2 p-4 overflow-y-scroll my-2">
              {messages.map((message, index) => (
                <div key={index} className="text-sm text-gray-700 flex gap-2">
                  <div className="bg-blue-300 text-blue-800 px-2 py-1 rounded-md">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md">
                    {message.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <Group caseName={case_name} />
              <Overview
                caseName={case_name}
                callBackFunction={callbackFunction}
                triggerProcess={triggerProcess}
                handleProcessLoad={handleProcessLoad}
              />
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
}
