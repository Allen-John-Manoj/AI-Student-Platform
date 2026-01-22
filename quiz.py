import google.generativeai as genai
import json
import random

class CareerAssessment:
    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name="gemini-2.5-flash")
        self.categories = ["analytical", "creative", "social", "practical", "leadership", 
                         "numerical", "verbal", "scientific", "artistic", "theoretical", 
                         "visual", "independent", "structured", "achievement"]

    def _generate_questions(self, user_description):
        prompt = f"""
        Based on this user description: "{user_description}"
        Generate a career assessment questionnaire with 9 non-repeating questions across 3 areas. Ensure no two questions are the same:
        1. Interests
        2. Academic/Skills
        3. Workstyle
        
        Return ONLY valid JSON matching this structure:
        {{
            "areas": {{
                "interests": {{
                    "questions": [
                        {{
                            "question": "string",
                            "options": {{
                                "A": "string",
                                "B": "string",
                                "C": "string",
                                "D": "string"
                            }},
                            "category": ["string", "string", "string", "string"]
                        }}
                    ]
                }}
            }}
        }}
        Categories must be from: {self.categories}"""

        try:
            response = self.model.generate_content(prompt)
            text_response = response.candidates[0].content.parts[0].text.strip()
            text_response = text_response.replace('```json', '').replace('```', '').strip()
            return json.loads(text_response)
        except Exception as e:
            print(f"Error generating questions: {str(e)}")
            return None

    def _generate_skill_questions(self, career_title):
        prompt = f"""
        Generate 10 multiple-choice questions for the career path "{career_title}".
        Each question should have 4 options (A, B, C, D) with one correct answer and an explanation.
        Return ONLY valid JSON matching this structure:
        {{
            "questions": [
                {{
                    "question": "string",
                    "options": {{
                        "A": "string",
                        "B": "string",
                        "C": "string",
                        "D": "string"
                    }},
                    "correct_answer": "A",  // One of A, B, C, or D
                    "explanation": "string"
                }}
            ]
        }}"""

        try:
            response = self.model.generate_content(prompt)
            text_response = response.candidates[0].content.parts[0].text.strip()
            text_response = text_response.replace('```json', '').replace('```', '').strip()
            return json.loads(text_response)
        except Exception as e:
            print(f"Error generating skill questions: {str(e)}")
            return None

    def _generate_recommendations(self, trait_scores, responses, user_description):
        prompt = f"""
        User Description: {user_description}
        Trait Scores: {json.dumps(trait_scores, indent=2)}
        Response Pattern: {json.dumps(responses, indent=2)}

        Generate personalized career recommendations. Return ONLY valid JSON:
        {{
            "career_paths": [
                {{
                    "title": "string",
                    "description": "string",
                    "required_skills": ["string"]
                }}
            ],
            "learning_resources": [
                {{
                    "type": "string",
                    "description": "string",
                    "where": "string"
                }}
            ],
            "next_steps": ["string"]
        }}"""

        try:
            response = self.model.generate_content(prompt)
            text_response = response.candidates[0].content.parts[0].text.strip()
            text_response = text_response.replace('```json', '').replace('```', '').strip()
            return json.loads(text_response)
        except Exception as e:
            print(f"Error generating recommendations: {str(e)}")
            return None

    def _test_skills(self, career_title):
        skill_questions = self._generate_skill_questions(career_title)
        if not skill_questions:
            print("\nSorry, there was an error generating the quiz questions.")
            return

        print(f"\n=== TEST YOUR SKILLS: {career_title.upper()} ===")
        score = 0
        for idx, q in enumerate(skill_questions["questions"], start=1):
            print(f"\nQ{idx}: {q['question']}")
            for key, value in q['options'].items():
                print(f"{key}: {value}")

            while True:
                answer = input("\nYour answer (A/B/C/D): ").upper()
                if answer in ['A', 'B', 'C', 'D']:
                    break
                print("Please enter A, B, C, or D.")

            if answer == q['correct_answer']:
                print("Correct!")
                score += 1
            else:
                print(f"Incorrect. The correct answer is {q['correct_answer']}: {q['options'][q['correct_answer']]}")
                print(f"Explanation: {q['explanation']}")

        print(f"\nYour score: {score}/{len(skill_questions['questions'])}")

    def run_assessment(self):
        print("Welcome! To personalize your assessment, please tell us about yourself:")
        print("(Include your background, interests, and what you're looking for in a career)")
        user_description = input("\nYour description: ")

        assessment_areas = self._generate_questions(user_description)
        if not assessment_areas:
            return None

        responses = {}
        trait_scores = {category: 0 for category in self.categories}

        for area, content in assessment_areas["areas"].items():
            area_responses = []
            print(f"\n=== {area.upper()} Assessment ===")

            for q in content["questions"]:
                print(f"\n{q['question']}")
                for key, value in q["options"].items():
                    print(f"{key}: {value}")

                while True:
                    answer = input("\nYour answer (A/B/C/D): ").upper()
                    if answer in ['A', 'B', 'C', 'D']:
                        break
                    print("Please enter A, B, C, or D.")

                trait_index = ord(answer) - ord('A')
                trait_scores[q["category"][trait_index]] += 1
                area_responses.append(answer)
            
            responses[area] = area_responses

        recommendations = self._generate_recommendations(trait_scores, responses, user_description)
        if not recommendations:
            print("\nSorry, there was an error generating your recommendations.")
            return

        print("\nYour Career Recommendations:")
        for idx, career in enumerate(recommendations["career_paths"], start=1):
            print(f"{idx}. {career['title']}: {career['description']}")

        while True:
            print("\nOptions:")
            print("1. Test Your Skills")
            print("2. Quit")
            choice = input("\nChoose an option (1/2): ")

            if choice == "1":
                career_choice = int(input("\nEnter the number of the career you want to test your skills for: "))
                if 1 <= career_choice <= len(recommendations["career_paths"]):
                    selected_career = recommendations["career_paths"][career_choice - 1]
                    self._test_skills(selected_career['title'])
                else:
                    print("Invalid choice. Try again.")
            elif choice == "2":
                print("Goodbye!")
                break
            else:
                print("Invalid option. Please select 1 or 2.")

def main():
    import os
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is required")
    assessment = CareerAssessment(api_key)
    assessment.run_assessment()

if __name__ == "__main__":
    main()
