@echo off
cd /d C:\Users\khismart\Downloads\journal-site
call venv\Scripts\activate
cd server
set FLASK_APP=app.py
flask run
cmd /k
