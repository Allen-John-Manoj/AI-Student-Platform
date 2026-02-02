# Flask application for AI-powered student career assessment platform
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from quiz import CareerAssessment

app = Flask(__name__)
CORS(app)

assessment = CareerAssessment()

@app.route('/')
def index():
    return send_file('quiz.html')

@app.route('/bg.png')
def background():
    return send_file('bg.png')

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    data = request.json
    user_description = data.get('userDescription')
    if not user_description:
        return jsonify({"error": "User description is required"}), 400
    
    questions = assessment._generate_questions(user_description)
    if questions is None:
        return jsonify({"error": "Failed to generate questions. Please try again."}), 500
    return jsonify(questions)

@app.route('/generate-recommendations', methods=['POST'])
def generate_recommendations():
    data = request.json
    trait_scores = data.get('traitScores')
    responses = data.get('responses')
    user_description = data.get('userDescription')
    
    if not all([trait_scores, responses, user_description]):
        return jsonify({"error": "Missing required data"}), 400
    
    recommendations = assessment._generate_recommendations(trait_scores, responses, user_description)
    if recommendations is None:
        return jsonify({"error": "Failed to generate recommendations. Please try again."}), 500
    return jsonify(recommendations)

@app.route('/skill-test', methods=['POST'])
def skill_test():
    data = request.json
    career_title = data.get('careerTitle')
    if not career_title:
        return jsonify({"error": "Career title is required"}), 400
    
    questions = assessment._generate_skill_questions(career_title)
    if questions is None:
        return jsonify({"error": "Failed to generate skill test. Please try again."}), 500
    return jsonify(questions)

@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap():
    data = request.json
    career_title = data.get('careerTitle')
    required_skills = data.get('requiredSkills', [])
    user_description = data.get('userDescription', '')
    
    if not career_title:
        return jsonify({"error": "Career title is required"}), 400
    
    roadmap = assessment._generate_roadmap(career_title, required_skills, user_description)
    if roadmap is None:
        return jsonify({"error": "Failed to generate roadmap. Please try again."}), 500
    return jsonify(roadmap)

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
