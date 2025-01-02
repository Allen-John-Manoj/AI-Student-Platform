import { GoogleGenerativeAI } from '@google/generative-ai';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

class CareerAssessment {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    this.categories = ["analytical", "creative", "social", "practical", "leadership", 
                      "numerical", "verbal", "scientific", "artistic", "theoretical", 
                      "visual", "independent", "structured", "achievement"];
  }

  async _generateQuestions(userDescription) {
    const prompt = `
      Based on this user description: "${userDescription}"
      Generate a career assessment questionnaire with 6 questions across 3 areas:
      1. Interests
      2. Academic/Skills
      3. Work Style

      Return ONLY valid JSON matching this structure without any markdown formatting or code blocks:
      {
        "areas": {
          "interests": {
            "questions": [
              {
                "question": "string",
                "options": {
                  "A": "string",
                  "B": "string",
                  "C": "string",
                  "D": "string"
                },
                "category": ["string", "string", "string", "string"]
              }
            ]
          }
        }
      }
      Categories must be from: ${this.categories}
      Do not include any markdown formatting symbols in the response.`;

try {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text);
} catch (error) {
    console.error("Error generating questions:", error);
    return null;
}
}

  async _generateRecommendations(traitScores, responses, userDescription) {
    const prompt = `
      User Description: ${userDescription}
      Trait Scores: ${JSON.stringify(traitScores, null, 2)}
      Response Pattern: ${JSON.stringify(responses, null, 2)}

      Generate atmost 5 and atleast 2 personalized career recommendations. Return ONLY valid JSON without any markdown formatting or code blocks:
      {
        "career_paths": [
          {
            "title": "string",
            "description": "string",
            "required_skills": ["string"]
          }
        ],
        "learning_resources": [
          {
            "type": "string",
            "description": "string",
            "where": "string"
          }
        ],
        "next_steps": ["string"]
      }
      Do not include any markdown formatting symbols in the response.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return null;
    }
  }

  async runAssessment() {
    console.log("Welcome! To personalize your assessment, please tell us about yourself:");
    console.log("(Include your background, interests, and what you're looking for in a career)");
    
    const userDescription = await this._getUserInput("\nYour description: ");
    const assessmentAreas = await this._generateQuestions(userDescription);
    
    if (!assessmentAreas) return null;

    const responses = {};
    const traitScores = Object.fromEntries(this.categories.map(category => [category, 0]));

    for (const [area, content] of Object.entries(assessmentAreas.areas)) {
      const areaResponses = [];
      console.log(`\n=== ${area.toUpperCase()} Assessment ===`);

      for (const q of content.questions) {
        console.log(`\n${q.question}`);
        Object.entries(q.options).forEach(([key, value]) => {
          console.log(`${key}: ${value}`);
        });

        let answer;
        do {
          answer = (await this._getUserInput("\nYour answer (A/B/C/D): ")).toUpperCase();
        } while (!['A', 'B', 'C', 'D'].includes(answer));

        const traitIndex = answer.charCodeAt(0) - 'A'.charCodeAt(0);
        traitScores[q.category[traitIndex]]++;
        areaResponses.push(answer);
      }
      
      responses[area] = areaResponses;
    }

    return this._generateRecommendations(traitScores, responses, userDescription);
  }

  async _getUserInput(prompt) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question(prompt, answer => {
        rl.close();
        resolve(answer);
      });
    });
  }
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFile) {
  const apiKey = process.env.GOOGLE_API_KEY || "AIzaSyC0lHjL55wzQnp_no20DTTzJCNguNeL3Vo";
  const assessment = new CareerAssessment(apiKey);
  assessment.runAssessment()
    .then(results => {
      if (results) {
        console.log("\nYour Career Recommendations:");
        console.log(JSON.stringify(results, null, 2));
      } else {
        console.log("\nSorry, there was an error generating your recommendations.");
      }
    })
    .catch(console.error);
}

export default CareerAssessment;