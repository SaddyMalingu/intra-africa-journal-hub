@echo off
cd /d C:\Users\khismart\Downloads\journal-site
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
echo.
echo ✅ Environment ready! Now run start_server.bat and start_client.bat
pause
