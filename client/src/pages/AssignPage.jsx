import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button"; // ✅ relative import
import { successToast, errorToast } from "../components/ui/toast"; // ✅ relative import

const AssignPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [googleDocLink, setGoogleDocLink] = useState("");
  const [reviewerEmails, setReviewerEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAssign = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/assign-reviewer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          google_doc_link: googleDocLink,
          reviewer_emails: reviewerEmails.split(",").map((email) => email.trim()),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        successToast("Reviewers assigned successfully! ✅");
        setMessage("Reviewers assigned successfully!");
        setGoogleDocLink("");
        setReviewerEmails("");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        errorToast(data.error || "Failed to assign reviewers.");
        setMessage(data.error || "Failed to assign reviewers.");
      }
    } catch (error) {
      console.error(error);
      errorToast("An error occurred. Please try again.");
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
      <div className="w-full max-w-lg bg-white text-gray-800 rounded-lg p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Assign Reviewers</h1>
        <p className="text-center mb-8">
          Submission ID: <strong>{submissionId}</strong>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Google Doc Link</label>
            <input
              type="text"
              className="w-full rounded border p-2"
              value={googleDocLink}
              onChange={(e) => setGoogleDocLink(e.target.value)}
              placeholder="Paste editable Google Doc link here"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Reviewer Emails</label>
            <input
              type="text"
              className="w-full rounded border p-2"
              value={reviewerEmails}
              onChange={(e) => setReviewerEmails(e.target.value)}
              placeholder="Enter emails separated by commas"
              disabled={loading}
            />
          </div>

          {message && (
            <div className="text-center text-green-600 font-semibold">
              {message}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => navigate("/dashboard")} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={loading}>
              {loading ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignPage;
