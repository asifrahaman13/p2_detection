"use client";
import config from "@/config/config";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Case } from "@/types/dashboard/dashboard";

const MyCases: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const [cases, setCases] = useState<Case[]>([]);
  useEffect(() => {
    async function fetchAllCases() {
      try {
        // Using axios
        const response = await axios.get(
          `${config.backendUrl}/api/v1/user/pdfs/${"user"}`,
        );
        if (response.status === 200) {
          console.log(response.data);
          setCases(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchAllCases();
  }, []);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [caseName, setCaseName] = useState("");

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const router = useRouter();

  const handleCreateCase = () => {
    if (caseName.trim() === "") return; // Simple validation for case name
    closeModal();
    router.push(`/dashboard/cases/${caseName}/create-case`);
  };

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
          <div className="p-2 w-2/12 border-l-0 border-r-0 text-buttonTextColor font-medium">
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
              href={`/dashboard/cases/${caseItem.path}`}
              className="w-full flex"
            >
              <div className="p-2 w-3/12 border-l-0 border-r-0">
                {caseItem.path}
              </div>
              <div className="p-2 w-2/12 border-l-0 border-r-0">Processed</div>
              <div className="p-2 w-4/12 border-l-0 border-r-0">
                10/21/2024, 11:49 am
              </div>
              <div className="p-2 w-3/12 border-l-0 border-r-0">
                Annie Adjuster
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {/* <div className="flex justify-between items-center mt-4">
        <p>1-8 of 150 claims</p>
        <div className="flex items-center space-x-2">
          <p>Show</p>
          <select className="border p-1 rounded">
            <option value="10">10</option>
            <option value="25" selected>
              25
            </option>
            <option value="50">50</option>
          </select>
        </div>
      </div> */}
    </div>
  );
};

export default MyCases;
