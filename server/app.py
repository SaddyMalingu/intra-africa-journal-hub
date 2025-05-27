from flask import Flask, request, jsonify 
from flask_cors import CORS
import os
import requests
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# ✅ Update: Restrict CORS to Vercel frontend only
CORS(app, origins=["https://intra-africa-journal-hub.vercel.app"], supports_credentials=True)

# Get environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = "submissions"

SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

# Relevance AI Webhook info
RELEVANCE_API_URL = "https://api-d7b62b.stack.tryrelevance.com/latest/studios/d7f0ca6d-60c9-42c2-a0b8-25c610f5c558/trigger_webhook?project=243d8bc57206-4045-ae29-16c0aef3c4f3"
RELEVANCE_API_KEY = "243d8bc57206-4045-ae29-16c0aef3c4f3:sk-MzAzZDg2MDEtNzk2Yi00NTc1LWE2MWEtYTA2NzRiZjIxYmQw"

# Home route
@app.route("/")
def home():
    return "Hello from Flask backend with Supabase integration!"

# Upload file helper (✅ FIXED ENDPOINT & METHOD)
def upload_file_to_supabase(file_content, filename, file_type):
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{filename}"

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": file_type
    }

    response = requests.put(upload_url, headers=headers, data=file_content)

    if response.status_code == 409:
        print("Duplicate file upload detected:", response.text)
        return "duplicate"

    if response.status_code not in (200, 201):
        print("File upload failed:", response.text)
        return None

    file_path = f"{SUPABASE_BUCKET}/{filename.lstrip('/')}"
    return file_path

# Insert metadata helper
def insert_submission_metadata(title, author, abstract, file_path, file_size, file_type, file_name):
    file_url = f"https://{SUPABASE_URL.split('https://')[1]}/storage/v1/object/public/{file_path}"

    data = {
        "title": title,
        "author": author,
        "abstract": abstract,
        "file_path": file_path,
        "file_size": file_size,
        "file_type": file_type,
        "file_name": file_name,
        "file_url": file_url
    }

    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/submissions",
        headers=SUPABASE_HEADERS,
        json=data
    )

    print("📦 Metadata payload:", data)
    print("📥 Supabase response:", response.status_code, response.text)

    if response.status_code not in (200, 201):
        return False

    return True

# Handle journal submission
@app.route('/api/submission', methods=['POST'])
def submit_journal():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    title = request.form.get('title')
    author = request.form.get('author')
    abstract = request.form.get('abstract')

    if not file or not title or not author or not abstract:
        return jsonify({"error": "Missing required fields"}), 400

    filename = secure_filename(file.filename)
    file_content = file.read()
    file_size = len(file_content)
    file_type = file.content_type

    file_upload_response = upload_file_to_supabase(
        file_content=file_content,
        filename=filename,
        file_type=file_type
    )

    if file_upload_response == "duplicate":
        return jsonify({"error": "Duplicate submission. This file already exists."}), 409

    if not file_upload_response:
        return jsonify({"error": "Failed to upload file"}), 500

    success = insert_submission_metadata(
        title, author, abstract,
        file_path=file_upload_response,
        file_size=file_size,
        file_type=file_type,
        file_name=filename  # ✅ Save original filename
    )

    if not success:
        return jsonify({"error": "Failed to save metadata"}), 500

    return jsonify({
        "message": "Submission received!",
        "file_path": file_upload_response,
        "file_name": filename
    }), 201

# Fetch all submissions
@app.route('/api/submissions', methods=['GET'])
def get_submissions():
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/submissions?select=*",
        headers=SUPABASE_HEADERS
    )

    if response.status_code != 200:
        print("Failed to fetch submissions:", response.text)
        return jsonify({"error": "Failed to fetch submissions"}), 500

    submissions = response.json()
    return jsonify(submissions), 200

# ✅ New: Assign reviewers via Relevance AI webhook
@app.route('/api/trigger-assign', methods=['POST'])
def trigger_assign():
    data = request.get_json()

    # Basic input validation
    required_fields = ['submitted_file_text', 'author_name', 'project_title', 'abstract']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing one or more required fields."}), 400

    try:
        response = requests.post(
            RELEVANCE_API_URL,
            headers={
                "Authorization": f"Bearer {RELEVANCE_API_KEY}",
                "Content-Type": "application/json"
            },
            json=data
        )

        if response.status_code not in (200, 201):
            print("Webhook trigger failed:", response.text)
            return jsonify({"error": "Failed to trigger webhook"}), 500

        return jsonify({"message": "Reviewer assigned and email sent successfully."}), 200

    except Exception as e:
        print("Error triggering assign:", str(e))
        return jsonify({"error": "Internal server error"}), 500

# ✅ Still here: Manual reviewer assignment (optional legacy path)
@app.route('/api/assign-reviewer', methods=['POST'])
def assign_reviewer():
    data = request.get_json()

    submission_id = data.get('submission_id')
    reviewer_emails = data.get('reviewer_emails')
    google_doc_link = data.get('google_doc_link')

    if not submission_id or not reviewer_emails or not google_doc_link:
        return jsonify({"error": "Missing required fields"}), 400

    errors = []

    for email in reviewer_emails:
        payload = {
            "submission_id": submission_id,
            "reviewer_email": email,
            "google_doc_link": google_doc_link,
            "status": "Pending",
            "vote": None
        }

        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/review_assignments",
            headers=SUPABASE_HEADERS,
            json=payload
        )

        if response.status_code not in (200, 201):
            print(f"Failed to assign {email}:", response.text)
            errors.append({"email": email, "error": response.text})

    if errors:
        return jsonify({"error": "Failed to assign some reviewers", "details": errors}), 500

    return jsonify({"message": "Reviewers assigned successfully!"}), 201

# Main runner
if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_ENV", "development") != "production"
    app.run(debug=debug_mode)
