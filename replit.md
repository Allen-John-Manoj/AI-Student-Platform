# AI Career Assessment Platform

## Overview
An AI-powered career assessment web application that helps users discover suitable career paths based on their interests, skills, and work style preferences. Uses Google's Gemini AI to generate personalized career recommendations.

## Project Structure
- `app.py` - Flask backend server (serves HTML and API endpoints)
- `quiz.py` - CareerAssessment class with AI-powered question generation and recommendations
- `quiz.html` - Frontend interface (single-page application)
- `bg.png` - Background image

## API Endpoints
- `GET /` - Serves the main quiz interface
- `POST /generate-questions` - Generates assessment questions based on user description
- `POST /generate-recommendations` - Generates career recommendations based on responses
- `POST /skill-test` - Generates skill test questions for a specific career

## Tech Stack
- Backend: Python 3.11, Flask, Flask-CORS
- AI: Google Generative AI (Gemini 1.5 Flash)
- Frontend: HTML, CSS, JavaScript (vanilla)

## Running the App
The app runs on port 5000 with `python app.py`

## Environment Variables
- `GEMINI_API_KEY` - Google Gemini API key (optional, has fallback)

## Recent Changes
- January 2026: Configured for Replit environment
  - Updated API endpoints to use relative paths
  - Configured Flask to bind to 0.0.0.0:5000
  - Added cache control headers
