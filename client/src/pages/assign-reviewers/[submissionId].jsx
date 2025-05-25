// src/pages/AssignPage.jsx
import React from "react";
import { useParams } from "react-router-dom";

const AssignPage = () => {
  const { submissionId } = useParams();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Assign Reviewers</h1>
      <p className="text-lg text-gray-700">
        Assigning reviewers for submission ID: <span className="font-mono">{submissionId}</span>
      </p>

      {/* Assignment form or reviewer logic will go here */}
    </div>
  );
};

export default AssignPage;
