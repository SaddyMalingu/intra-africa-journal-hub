from flask import Flask, request, jsonify 
from flask_cors import CORS
import os
import requests
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from flask_mail import Mail, Message

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Flask-Mail setup
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('GMAIL_USER')
app.config['MAIL_PASSWORD'] = os.getenv('GMAIL_PASS')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('GMAIL_USER')

mail = Mail(app)

# Restrict CORS to frontend
CORS(app, origins=["https://intra-africa-journal-hub.vercel.app"], supports_credentials=True)

# Supabase config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = "submissions"

SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

@app.route("/")
def home():
    return "Hello from Flask backend with Supabase integration!"

# Upload file to Supabase
def upload_file_to_supabase(file_content, filename, file_type):
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{filename}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": file_type
    }

    response = requests.put(upload_url, headers=headers, data=file_content)
    if response.status_code == 409:
        return "duplicate"
    if response.status_code not in (200, 201):
        return None

    return f"{SUPABASE_BUCKET}/{filename.lstrip('/')}"

# Save submission metadata
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
    return response.status_code in (200, 201)

# Submit journal
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
        file_name=filename
    )

    if not success:
        return jsonify({"error": "Failed to save metadata"}), 500

    return jsonify({
        "message": "Submission received!",
        "file_path": file_upload_response,
        "file_name": filename
    }), 201

# Fetch submissions
@app.route('/api/submissions', methods=['GET'])
def get_submissions():
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/submissions?select=*",
        headers=SUPABASE_HEADERS
    )

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch submissions"}), 500

    return jsonify(response.json()), 200

# Assign reviewer (manual path)
@app.route('/api/assign-reviewer', methods=['POST'])
def assign_reviewer():
    data = request.get_json()
    submission_id = data.get('submission_id')
    reviewer_email = data.get('reviewer_email')

    if not submission_id or not reviewer_email:
        return jsonify({"error": "Missing required fields"}), 400

    payload = {
        "submission_id": submission_id,
        "reviewer_email": reviewer_email,
        "status": "Pending",
        "vote": None
    }

    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/review_assignments",
        headers=SUPABASE_HEADERS,
        json=payload
    )

    if response.status_code not in (200, 201):
        return jsonify({"error": "Failed to assign reviewer"}), 500

    return jsonify({"message": "Reviewer assigned successfully!"}), 201

# ✅ Flask-Mail email sender
@app.route("/api/send-review-email", methods=["POST"])
def send_review_email():
    data = request.get_json()
    reviewer_email = data.get("reviewer_email")
    title = data.get("title")
    author = data.get("author")
    abstract = data.get("abstract")
    file_url = data.get("file_url")

    if not reviewer_email or not title or not file_url:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        msg = Message(
            subject=f"Review Request: {title}",
            recipients=[reviewer_email],
            body=f"""
Hello Reviewer,

You have been assigned to review a new journal submission.

Title: {title}
Author: {author}
Abstract: {abstract}

Download the submission file here:
{file_url}

Please acknowledge this assignment.

Regards,
Editorial Team
"""
        )
        mail.send(msg)
        return jsonify({"message": "Email sent successfully"}), 200

    except Exception as e:
        print("Email sending failed:", e)
        return jsonify({"error": "Failed to send email"}), 500

# Start app
if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_ENV", "development") != "production"
    app.run(debug=debug_mode)
