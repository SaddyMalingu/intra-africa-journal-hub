import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/components/ui/toast";

const AssignReviewerModal = ({ isOpen, onClose, submissionId, onSuccess }) => {
  const [googleDocLink, setGoogleDocLink] = useState("");
  const [reviewerEmails, setReviewerEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

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

        if (onSuccess) onSuccess();

        setTimeout(() => {
          onClose();
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

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Assign Reviewers</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Google Doc Link</label>
              <input
                type="text"
                className="w-full mt-1 rounded border p-2"
                value={googleDocLink}
                onChange={(e) => setGoogleDocLink(e.target.value)}
                placeholder="Paste editable Google Doc link here"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Reviewer Emails</label>
              <input
                type="text"
                className="w-full mt-1 rounded border p-2"
                value={reviewerEmails}
                onChange={(e) => setReviewerEmails(e.target.value)}
                placeholder="Enter emails separated by commas"
                disabled={loading}
              />
            </div>

            {message && (
              <div className="text-sm text-center text-green-600 font-semibold">
                {message}
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={loading}>
                {loading ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default AssignReviewerModal;
