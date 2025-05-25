import React from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import JournalSubmission from "./components/JournalSubmission";
import SubmissionsDashboard from "./components/SubmissionsDashboard";
import AssignPage from "./pages/assign-reviewers/[submissionId]";

const SubmissionPage = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100 p-8 overflow-auto">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Submit Your Journal
        </h1>
        <JournalSubmission />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full p-4 flex justify-center space-x-8 bg-gray-800 z-20">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "text-yellow-400 font-bold underline"
              : "text-white hover:text-gray-400"
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "text-yellow-400 font-bold underline"
              : "text-white hover:text-gray-400"
          }
        >
          Dashboard
        </NavLink>
      </nav>

      {/* Routes */}
      <div className="pt-16 h-full w-full overflow-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit" element={<SubmissionPage />} />
          <Route path="/dashboard" element={<SubmissionsDashboard />} />
          <Route path="/assign-reviewers/:submissionId" element={<AssignPage />} />
          <Route
            path="*"
            element={
              <div className="text-center text-2xl text-white mt-10">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
