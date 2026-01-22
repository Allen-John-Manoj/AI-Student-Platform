# PathFinder Pro - AI Career Assessment Platform

## Overview
An elite AI-powered career assessment platform that helps users discover suitable career paths through personalized questionnaires. Uses Claude AI (claude-sonnet-4-5) to generate assessment questions, provide career recommendations with detailed roadmaps, and offer skill tests.

## Project Structure
- `app.py` - Flask backend server with API endpoints
- `quiz.py` - CareerAssessment class with Claude-powered AI features
- `quiz.html` - Premium frontend interface with modern dark theme
- `bg.png` - Background image (legacy, no longer used)

## Key Features
- **AI-Powered Assessment**: 9-question questionnaire across interests, skills, and workstyle
- **Career Matching**: Personalized career recommendations with match percentages
- **Career Roadmaps**: Step-by-step achievement paths with milestones and resources
- **Skills Testing**: 10-question quizzes to assess readiness for each career
- **Personality Insights**: Trait analysis and visualization

## API Endpoints
- `GET /` - Serves the main application
- `POST /generate-questions` - Generates assessment questions based on user description
- `POST /generate-recommendations` - Generates career recommendations based on responses
- `POST /skill-test` - Generates skill test questions for a specific career
- `POST /generate-roadmap` - Generates detailed career achievement roadmap

## Tech Stack
- Backend: Python 3.11, Flask, Flask-CORS
- AI: Anthropic Claude (claude-sonnet-4-5) via Replit AI Integrations
- Frontend: HTML5, CSS3 (modern glassmorphism), JavaScript (vanilla)
- Icons: FontAwesome 6.4
- Typography: Inter (Google Fonts)

## Running the App
The app runs on port 5000 with `python app.py`

## Environment Variables
Uses Replit AI Integrations (automatically configured):
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` - Claude API key
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` - Claude API base URL

## Design System
- Primary: #6366f1 (Indigo)
- Accent: #f472b6 (Pink)
- Secondary Accent: #22d3ee (Cyan)
- Success: #10b981 (Emerald)
- Background: #0a0a1a (Dark)
- Features animated gradient backgrounds, floating particles, and glassmorphism

## Recent Changes
- January 2026: Major UI/UX overhaul
  - Complete redesign with premium dark theme
  - Added animated gradient backgrounds and floating particles
  - Enhanced glassmorphism effects
  - Added career roadmap feature with milestones and resources
  - Added personality insights dashboard with trait visualization
  - Enhanced career cards with match scores, salary ranges, growth outlook
  - Improved skills test with progress tracking and detailed feedback
  - Added step navigation header
  - Switched from Gemini to Claude AI (claude-sonnet-4-5)
  - Added robust error handling for all API endpoints
  - Removed exposed API keys, now using Replit AI Integrations
