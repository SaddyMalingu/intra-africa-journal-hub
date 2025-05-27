import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const SUPABASE_PUBLIC_URL = "https://jyornhragxexaipvkbvl.supabase.co/storage/v1/object/public";
const BUCKET_NAME = "submissions";

const RELEVANCE_API_URL = "https://api-d7b62b.stack.tryrelevance.com/latest/studios/d7f0ca6d-60c9-42c2-a0b8-25c610f5c558/trigger_webhook?project=243d8bc57206-4045-ae29-16c0aef3c4f3";
const API_KEY = "243d8bc57206-4045-ae29-16c0aef3c4f3:sk-MzAzZDg2MDEtNzk2Yi00NTc1LWE2MWEtYTA2NzRiZjIxYmQw";

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

  const handleRelevanceAssign = async (submission) => {
    const publicFileUrl = `${SUPABASE_PUBLIC_URL}/${BUCKET_NAME}/${submission.file_name}`;
    const payload = {
      author_name: submission.author,
      project_title: submission.title,
      abstract: submission.abstract,
      file_url: publicFileUrl,
      file_name: submission.file_name
    };

    try {
      const response = await fetch(RELEVANCE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to assign reviewer via Relevance");

      alert("Relevance webhook triggered and email sent successfully.");
    } catch (error) {
      console.error("Relevance assignment failed:", error);
      alert("Failed to trigger Relevance webhook.");
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
                          onClick={() => handleRelevanceAssign(submission)}
                          variant="default"
                          size="sm"
                        >
                          Relevance
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
