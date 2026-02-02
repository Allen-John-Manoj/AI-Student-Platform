# AI-Student-Platform

## Getting Started

### Prerequisites
- Python 3.8 or higher
- Flask
- Gemini API key

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Allen-John-Manoj/AI-Student-Platform.git
   cd AI-Student-Platform
   ```
2. Install dependencies:
   ```bash
   pip install flask
   ```
3. Set up your Gemini API key as an environment variable.
4. Run the application:
   ```bash
   python app.py
   ```
5. Open your browser and navigate to `http://localhost:5000`

---

### Current status
- Personalized quiz to recommend careers, resources (general), and next steps.
- Uses Gemini API.
- Contains JS and Python versions. JS might make it easier to develop the web app.

### Update 1
- Finished "Test your skills" option in JS.
  - Uses API to generate 10 MCQ questions on the career option.
  - Standard functionality; no memory of previous tests, etc.
- Implemented a basic "Career Resources" option
  - Only lists general options (LinkedIn, YouTube).
  - No specific links or details.
### Improvements to make (in order of importance)
  - Severly improve "Career resources", with relevant resource links.
  - UI
  - Improve the MCQ part to have better questions relevant to the student's learning path.
  - Save user details and lesson progress, which the AI will access to teach and monitor performance
  - Add a prompt search bar, available in all pages, which enables the student to ask any questions relevant to the content being shown.
  - Improvements to the prompts being sent to the API.

### Update 2
- Deleted JS file and use python now.
- Frontend finished.
- Uses flask and python file as backend, and HTML, CSS, JS as frontend.
### Improvements to make (in order of importance)
  - Improve frontend stle for "Test your skills" section.
  - Severly improve "Career resources", with relevant resource links.
  - Improve the MCQ part to have better questions relevant to the student's learning path.
  - Save user details and lesson progress, which the AI will access to teach and monitor performance
  - Add a prompt search bar, available in all pages, which enables the student to ask any questions relevant to the content being shown.
  - Improvements to the prompts being sent to the API.
