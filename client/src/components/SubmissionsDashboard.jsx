import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const SUPABASE_PUBLIC_URL = "https://jyornhragxexaipvkbvl.supabase.co/storage/v1/object/public";
const BUCKET_NAME = "submissions";

const SubmissionsDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [reviewerEmail, setReviewerEmail] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get('https://intra-africa-journal-hub.onrender.com/api/submissions');
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAssign = async (submission) => {
    const reviewer = prompt("Enter reviewer email:");
    if (!reviewer) return;

    const publicFileUrl = `${SUPABASE_PUBLIC_URL}/${BUCKET_NAME}/${submission.file_name}`;

    const payload = {
      reviewer_email: reviewer,
      title: submission.title,
      author: submission.author,
      abstract: submission.abstract,
      file_url: publicFileUrl
    };

    try {
      const response = await axios.post(
        "https://intra-africa-journal-hub.onrender.com/api/send-review-email",
        payload
      );

      if (response.status === 200) {
        alert("Reviewer email sent successfully.");
      } else {
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error("Email error:", error);
      alert("Error sending reviewer email.");
    }
  };

  const handleManualAssign = async () => {
    if (!currentSubmission || !reviewerEmail) return;

    try {
      await axios.post("https://intra-africa-journal-hub.onrender.com/api/assign-reviewer", {
        submission_id: currentSubmission.id,
        reviewer_email: reviewerEmail
      });

      alert("Reviewer assigned and logged successfully.");
      setShowModal(false);
      setReviewerEmail("");
      setCurrentSubmission(null);
    } catch (err) {
      console.error("Assignment error:", err);
      alert("Failed to assign reviewer.");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  };

  if (loading) return <div>Loading submissions...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Journal Submissions Dashboard</h2>

      {/* Reviewer Assignment Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Reviewer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Assign reviewer for: <strong>{currentSubmission?.title}</strong></p>
            <Input
              type="email"
              placeholder="Reviewer email"
              value={reviewerEmail}
              onChange={(e) => setReviewerEmail(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleManualAssign}>Assign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border">Title</th>
                <th className="p-3 border">Author</th>
                <th className="p-3 border">Abstract</th>
                <th className="p-3 border">File Type</th>
                <th className="p-3 border">File Size</th>
                <th className="p-3 border">Download</th>
                <th className="p-3 border">Assign Reviewers</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => {
                const publicFileUrl = `${SUPABASE_PUBLIC_URL}/${BUCKET_NAME}/${submission.file_name}`;

                return (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{submission.title}</td>
                    <td className="p-3 border">{submission.author}</td>
                    <td className="p-3 border">{submission.abstract}</td>
                    <td className="p-3 border">{submission.file_type || 'Unknown'}</td>
                    <td className="p-3 border">{formatFileSize(submission.file_size)}</td>
                    <td className="p-3 border text-center">
                      <a
                        href={publicFileUrl}
                        download
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md transition"
                      >
                        Download
                      </a>
                    </td>
                    <td className="p-3 border text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={() => handleEmailAssign(submission)}
                          variant="default"
                          size="sm"
                        >
                          Email Reviewer
                        </Button>
                        <Button
                          onClick={() => {
                            setCurrentSubmission(submission);
                            setShowModal(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Manual
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubmissionsDashboard;
