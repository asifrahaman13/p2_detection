import React from "react";

type ProgressMessage = {
  status: string;
  timestamp: number;
};

interface ProgressUpdatesProps {
  messages: ProgressMessage[];
}

const ProgressUpdates: React.FC<ProgressUpdatesProps> = ({ messages }) => {
  if (!messages || messages.length === 0) return null;

  return (
    <React.Fragment>
      <div className="bg-white p-4 rounded-md mt-4 h-full overflow-y-scroll">
        <h3 className="text-sm font-medium text-gray-500 text-center py-2">
          UPDATES
        </h3>
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <div key={index} className="text-sm text-gray-700 flex gap-2">
              <div className="bg-blue-300 text-blue-800 px-2 py-1 rounded-md">
                {new Date(message.timestamp).toLocaleString()}
              </div>
              <div className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md">
                {message.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default ProgressUpdates;
