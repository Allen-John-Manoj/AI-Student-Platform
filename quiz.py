import anthropic
import json
import os

class CareerAssessment:
    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=os.environ.get("AI_INTEGRATIONS_ANTHROPIC_API_KEY"),
            base_url=os.environ.get("AI_INTEGRATIONS_ANTHROPIC_BASE_URL")
        )
        self.model = "claude-sonnet-4-5"
        self.categories = ["analytical", "creative", "social", "practical", "leadership", 
                         "numerical", "verbal", "scientific", "artistic", "theoretical", 
                         "visual", "independent", "structured", "achievement"]

    def _call_claude(self, prompt):
        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return message.content[0].text

    def _generate_questions(self, user_description):
        prompt = f"""Based on this user description: "{user_description}"
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
        }},
        "academic_skills": {{
            "questions": [...]
        }},
        "workstyle": {{
            "questions": [...]
        }}
    }}
}}
Categories must be from: {self.categories}
Return only the JSON, no other text."""

        try:
            text_response = self._call_claude(prompt)
            text_response = text_response.replace('```json', '').replace('```', '').strip()
            return json.loads(text_response)
        except Exception as e:
            print(f"Error generating questions: {str(e)}")
            return None

    def _generate_skill_questions(self, career_title):
        prompt = f"""Generate 10 multiple-choice questions for the career path "{career_title}".
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
            "correct_answer": "A",
            "explanation": "string"
        }}
    ]
}}
Return only the JSON, no other text."""

        try:
            text_response = self._call_claude(prompt)
            text_response = text_response.replace('```json', '').replace('```', '').strip()
            return json.loads(text_response)
        except Exception as e:
            print(f"Error generating skill questions: {str(e)}")
            return None

    def _generate_recommendations(self, trait_scores, responses, user_description):
        prompt = f"""User Description: {user_description}
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
}}
Return only the JSON, no other text."""

        try:
            text_response = self._call_claude(prompt)
            text_response = text_response.replace('```json', '').replace('```', '').strip()
            return json.loads(text_response)
        except Exception as e:
            print(f"Error generating recommendations: {str(e)}")
            return None

    def _generate_roadmap(self, career_title, required_skills, user_description):
        prompt = f"""Create a detailed career achievement roadmap for becoming a "{career_title}".

User Background: {user_description}
Required Skills: {json.dumps(required_skills)}

Generate a comprehensive step-by-step career roadmap with 4-5 phases/milestones. Each milestone should include specific actionable tasks.

Return ONLY valid JSON matching this structure:
{{
    "milestones": [
        {{
            "title": "Phase title (e.g., 'Foundation Building')",
            "duration": "Estimated time (e.g., '3-6 months')",
            "description": "Brief description of this phase",
            "tasks": [
                "Specific actionable task 1",
                "Specific actionable task 2",
                "Specific actionable task 3"
            ]
        }}
    ],
    "resources": [
        {{
            "type": "Course/Book/Certification/Community/Tool",
            "name": "Resource name or description"
        }}
    ]
}}

Make the roadmap practical, actionable, and tailored to someone starting from the user's background.
Return only the JSON, no other text."""

        try:
            text_response = self._call_claude(prompt)
            text_response = text_response.replace('```json', '').replace('```', '').strip()
            return json.loads(text_response)
        except Exception as e:
            print(f"Error generating roadmap: {str(e)}")
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
    assessment = CareerAssessment()
    assessment.run_assessment()

if __name__ == "__main__":
    main()
