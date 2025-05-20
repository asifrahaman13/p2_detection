"use client";
import config from "@/config/config";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileMetadata } from "@/types/dashboard/dashboard";

const MyCases: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [caseName, setCaseName] = useState<string>("");
  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);
  const [cases, setCases] = useState<FileMetadata[]>([]);

  const router = useRouter();

  useEffect(() => {
    async function fetchAllCases() {
      try {
        const response = await axios.get(
          `${config.backendUrl}/api/v1/docs/list-files`
        );
        if (response.status === 200) {
          console.log(response.data);
          setCases(response.data.files);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchAllCases();
  }, []);

  const handleCreateCase = () => {
    if (caseName.trim() === "") return;
    closeModal();
    router.push(`/dashboard/cases/${caseName}/create-case`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  function parseTimestamp(timestamp: number) {
    const date = new Date(timestamp);

    const formatted = date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return formatted;
  }

  return (
    <div className="p-4  bg-gray-100 w-full">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div className=" flex items-center gap-4  w-full">
          <button className="text-xl font-medium text-buttonTextColor border-b-2 px-2 border-sideBarBorder">
            My cases
          </button>
          <button className="text-xl  text-buttonTextColor">All cases</button>
        </div>
        <button onClick={openModal} className="w-1/6">
          <div className="border-blueButton border-2 text-center font-medium text-blueButton w-full py-2 rounded">
            + Create Case
          </div>
        </button>
      </div>

      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg w-1/3 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Enter Case Name</h2>
            <input
              type="text"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              placeholder="Case Name"
              className=" border-gray-300 p-2 w-full mb-4 rounded outline-none ring-0 border-0"
            />
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCase}
                className="bg-blueButton text-white py-2 px-4 rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex justify-between mb-4 gap-4 flex-col ">
        <button className="text-blue-500  flex justify-between">
          <div className="text-gray-800">1-8 of 150 claims</div>
          <div>Clear filters</div>
        </button>
        <div className="flex flex-row gap-6">
          <select className="border p-2 rounded bg-white">
            <option>Exclusions: (5)</option>
            {/* Add other exclusion options here */}
          </select>

          <input
            type="text"
            placeholder="Search by name, contact, or claim number"
            value={searchTerm}
            onChange={handleSearch}
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="w-full border border-gray-300">
        <div className="bg-gray-200 flex">
          <div className="p-2 w-3/12 border-l-0 border-r-0 text-buttonTextColor font-medium">
            Case Name
          </div>
          <div className="p-2 flex-1 border-l-0 border-r-0 text-buttonTextColor font-medium">
            Status
          </div>
          <div className="p-2 w-4/12 border-l-0 border-r-0 text-buttonTextColor font-medium">
            Last Updated
          </div>
          <div className="p-2 w-3/12 border-l-0 border-r-0 text-buttonTextColor font-medium">
            Last Updated By
          </div>
        </div>

        {cases?.map((caseItem, index) => (
          <div
            key={index}
            className={`${
              index % 2 !== 0 ? "bg-white" : ""
            } flex text-buttonTextColor border-2 border-gray-100`}
          >
            <Link
              href={`/dashboard/cases/${caseItem.file_name}`}
              className="w-full flex py-1"
            >
              <div className="p-2 w-3/12 border-l-0 border-r-0">
                {caseItem.file_name}
              </div>
              <div className="p-2 flex-1 border-l-0 border-r-0">
                <span
                  className={`rounded-lg px-3 py-1 text-sm inline-block ${
                    caseItem?.status === "uploaded"
                      ? "bg-blue-200 text-blue-800"
                      : "bg-green-300 text-green-800"
                  }`}
                >
                  {caseItem?.status}
                </span>
              </div>
              <div className="p-2 w-4/12 border-l-0 border-r-0">
                {parseTimestamp(caseItem?.timestamp)}
              </div>
              <div className="p-2 w-3/12 border-l-0 border-r-0">
                Annie Adjuster
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCases;
