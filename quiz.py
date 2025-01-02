import google.generativeai as genai
import json

class CareerAssessment:
    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        self.categories = ["analytical", "creative", "social", "practical", "leadership", 
                         "numerical", "verbal", "scientific", "artistic", "theoretical", 
                         "visual", "independent", "structured", "achievement"]
        
    def _generate_questions(self, user_description):
        prompt = f"""
        Based on this user description: "{user_description}"
        Generate a career assessment questionnaire with 6 questions across 3 areas:
        1. Interests
        2. Academic/Skills
        3. Work Style
        
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

        return self._generate_recommendations(trait_scores, responses, user_description)

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

def main():
    api_key = "AIzaSyC0lHjL55wzQnp_no20DTTzJCNguNeL3Vo"
    assessment = CareerAssessment(api_key)
    results = assessment.run_assessment()
    
    if results:
        print("\nYour Career Recommendations:")
        print(json.dumps(results, indent=2))
    else:
        print("\nSorry, there was an error generating your recommendations.")

if __name__ == "__main__":
    main()