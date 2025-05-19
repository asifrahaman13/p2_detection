/* eslint-disable @next/next/no-img-element */
"use client";
import config from "@/config/config";
import { useDocumentData } from "@/hooks/useDocumentData";
import axios from "axios";
import React, { useEffect, useState } from "react";

const Group = ({ caseName }: { caseName: string }) => {
  const [data, setDocumentData] = useDocumentData(caseName);

  const saveData = async () => {
    if (!data) return;
    try {
      await axios.post(`${config.backendUrl}/api/v1/docs/save`, data);
    } catch (err) {
      console.error("Error saving data", err);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (data) saveData();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [data, saveData]);
  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    idx: number,
  ) => {
    if (!data) return;
    const { name, value } = e.target;

    const updatedKeyPoints = data.key_points.map((point, i) =>
      i === idx ? { ...point, [name]: value } : point,
    );

    console.log("Updated key points:", updatedKeyPoints);

    setDocumentData({ ...data, key_points: updatedKeyPoints });
  };

  const addPoint = () => {
    if (!data) {
      const pdf = {
        pdf_name: caseName,
      };
      setDocumentData({
        ...pdf,
        key_points: [
          {
            entity: "",
            description: "",
            replaceWith: "",
          },
        ],
      });
      return;
    }

    setDocumentData({
      ...data,
      key_points: [
        ...data.key_points,
        {
          entity: "",
          description: "",
          replaceWith: "",
        },
      ],
    });
  };

  const handleDelete = (idx: number) => {
    if (!data) return;
    const updatedKeyPoints = [...data.key_points];
    updatedKeyPoints.splice(idx, 1);
    setDocumentData({ ...data, key_points: updatedKeyPoints });
  };

  return (
    <div>
      <div className="bg-white p-6 w-full gap-4 flex flex-col">
        <div className="flex flex-col gap-4">
          <div className="text-md font-semibold">Define filters</div>
          <div className="text-sm">
            Select the type of data you wish to mask.
          </div>
        </div>
        <div className="border-2 border-gray-100"></div>
        <div className="flex justify-between">
          <div className="text-lg font-medium">Key Data Extractions</div>
          <button onClick={addPoint}>
            <img
              src="/assets/dashboard/Circle Plus.svg"
              alt="Add"
              className="opacity-50"
            />
          </button>
        </div>

        {/* Document of Interest */}

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-200 font-semibold text-gray-700 rounded-md">
            <div>Entity</div>
            <div>Description</div>
            <div>Replace With</div>
            <div className="text-right">Action</div>
          </div>

          {/* Table Body */}
          {data?.key_points.map((point, idx) => (
            <div
              key={idx}
              className="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow-sm border items-start"
            >
              {/* Entity */}
              <textarea
                rows={3}
                name="entity"
                className=" bg-gray-100 text-blue-700 p-3 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Entity"
                value={point.entity}
                onChange={(e) => handleChange(e, idx)}
              />

              {/* Description */}
              <textarea
                rows={3}
                name="description"
                className=" bg-gray-100 text-blue-700 p-3 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Description"
                value={point.description}
                onChange={(e) => handleChange(e, idx)}
              />

              {/* Replace With */}
              <textarea
                rows={3}
                name="replaceWith"
                className=" bg-gray-100 text-blue-700 p-3 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Replace With"
                value={point.replaceWith}
                onChange={(e) => handleChange(e, idx)}
              />

              {/* Delete Button */}
              <div className="flex justify-end items-start pt-1">
                <button
                  onClick={() => handleDelete(idx)}
                  className="text-sm bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-full"
                >
                  ❌ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-2 border-gray-100"></div>
      </div>
    </div>
  );
};

export default Group;
