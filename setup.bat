@echo off
echo ========================================
echo ForgeLink Setup Script (Windows 11)
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found
echo.

echo [2/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [3/4] Setting up environment file...
if not exist .env.local (
    copy .env.example .env.local >nul
    echo ✓ Created .env.local file
    echo.
    echo IMPORTANT: Edit .env.local and add your Supabase credentials!
    echo.
    echo 1. Go to https://supabase.com and create a project
    echo 2. Get your Project URL and anon key from Project Settings - API
    echo 3. Open .env.local in Notepad and paste them in
    echo 4. Run the SQL from supabase-schema.sql in Supabase SQL Editor
    echo.
) else (
    echo ✓ .env.local already exists
    echo.
)

echo [4/4] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Configure .env.local with your Supabase credentials
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
echo Need help? Check README.md
echo ========================================
pause
