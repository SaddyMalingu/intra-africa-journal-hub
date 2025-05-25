import React, { useState } from "react";
import axios from "../api/axios"; // ✅ Correct import

const JournalSubmission = () => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    abstract: "",
    file: null,
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("author", formData.author);
      data.append("abstract", formData.abstract);
      data.append("file", formData.file);

      const response = await axios.post("/api/submission", data);

      if (response.status === 201 || response.status === 200) {
        setStatus("✅ Submission successful!");
        setFormData({
          title: "",
          author: "",
          abstract: "",
          file: null,
        });
      }
    } catch (error) {
      console.error("Error during submission:", error);

      if (error.response) {
        // Flask returned a JSON error
        const serverMessage = error.response.data?.error || "Something went wrong. Please try again.";
        setStatus(`❌ ${serverMessage}`);
      } else {
        // Network or unexpected error
        setStatus("❌ Failed to submit. Please try again later.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-8 rounded-lg shadow-lg space-y-6"
    >
      <div>
        <label className="block mb-2 font-bold">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-700 focus:outline-none"
        />
      </div>

      <div>
        <label className="block mb-2 font-bold">Author</label>
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-gray-700 focus:outline-none"
        />
      </div>

      <div>
        <label className="block mb-2 font-bold">Abstract</label>
        <textarea
          name="abstract"
          value={formData.abstract}
          onChange={handleChange}
          required
          rows="5"
          className="w-full p-3 rounded bg-gray-700 focus:outline-none"
        ></textarea>
      </div>

      <div>
        <label className="block mb-2 font-bold">Upload File (PDF or Word)</label>
        <input
          type="file"
          name="file"
          onChange={handleChange}
          accept=".pdf,.doc,.docx"
          required
          className="w-full p-3 rounded bg-gray-700 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition"
      >
        Submit
      </button>

      {status && (
        <p className="text-center mt-4 text-sm">
          {status}
        </p>
      )}
    </form>
  );
};

export default JournalSubmission;
