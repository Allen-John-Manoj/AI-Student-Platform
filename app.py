from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from quiz import CareerAssessment
import os

app = Flask(__name__)
CORS(app)

api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyC0lHjL55wzQnp_no20DTTzJCNguNeL3Vo")
assessment = CareerAssessment(api_key)

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
    return jsonify(recommendations)

@app.route('/skill-test', methods=['POST'])
def skill_test():
    data = request.json
    career_title = data.get('careerTitle')
    if not career_title:
        return jsonify({"error": "Career title is required"}), 400
    
    questions = assessment._generate_skill_questions(career_title)
    return jsonify(questions)

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
