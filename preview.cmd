@echo off
rem Double-click to preview the app: installs packages if needed, builds, and opens it in your browser.
rem Close this window (or press Ctrl+C) to stop the preview.
cd /d "%~dp0"
where npm >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org & pause & exit /b 1)
if not exist node_modules (
  echo Installing packages, first run only...
  call npm install || (pause & exit /b 1)
)
echo Building the app...
call npm run build || (pause & exit /b 1)
echo Opening the preview. Keep this window open while you use the app.
call npx vite preview --open
pause
