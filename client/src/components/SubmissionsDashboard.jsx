import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";

const SUPABASE_PUBLIC_URL = "https://jyornhragxexaipvkbvl.supabase.co/storage/v1/object/public";
const BUCKET_NAME = "submissions";

const RELEVANCE_API_URL = "https://api-d7b62b.stack.tryrelevance.com/latest/studios/d7f0ca6d-60c9-42c2-a0b8-25c610f5c558/trigger_webhook?project=243d8bc57206-4045-ae29-16c0aef3c4f3";
const API_KEY = "243d8bc57206-4045-ae29-16c0aef3c4f3:sk-MzAzZDg2MDEtNzk2Yi00NTc1LWE2MWEtYTA2NzRiZjIxYmQw";

const SubmissionsDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleAssign = async (submission) => {
    const publicFileUrl = `${SUPABASE_PUBLIC_URL}/${BUCKET_NAME}/${submission.file_name}`;
    const payload = {
      submitted_file_text: publicFileUrl,
      author_name: submission.author,
      project_title: submission.title,
      abstract: submission.abstract
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

      if (!response.ok) throw new Error("Failed to assign reviewer");

      alert("Reviewer assigned and email sent successfully.");
    } catch (error) {
      console.error("Assignment failed:", error);
      alert("Failed to assign reviewer. Check console for details.");
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
                      <Button
                        onClick={() => handleAssign(submission)}
                        variant="default"
                        size="sm"
                      >
                        Assign
                      </Button>
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
