import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GOOGLE_API_KEY;

class CareerAssessment {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    this.categories = [
      "analytical", "creative", "social", "practical", "leadership",
      "numerical", "verbal", "scientific", "artistic", "theoretical",
      "visual", "independent", "structured", "achievement"
    ];
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
            console.log("Generating questions with prompt:", prompt);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
            console.log("Raw question response:", text);
            const parsedResponse = JSON.parse(text);
            console.log("Parsed question response:", parsedResponse);
            return parsedResponse;
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
        console.log("Generating recommendations with prompt:", prompt);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
        const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
        console.log("Raw recommendations response:", text);
        const parsedResponse = JSON.parse(text);
        console.log("Parsed recommendations response:", parsedResponse);
      return parsedResponse;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return null;
    }
  }

  async _testSkills(chosenCareer) {
    const prompt = `
        Generate 10 skill and knowledge-testing questions related to the career path ${chosenCareer}. The question should include the following:
        1. A multiple-choice question with 4 options labeled A, B, C, and D.
        2. Indicate the correct answer.
        3. Provide an explanation for why the correct answer is correct.
        4. If the user answers incorrectly, explain what was wrong with their answer and provide the correct answer.
        
        Return the response as a valid JSON object with the following structure:
        [
            {
            "question": "string",
            "options": {
            "A": "string",
            "B": "string",
            "C": "string",
            "D": "string"
            },
            "correct_answer": "string",
            "explanation": "string"
            }
        ]
            Do not include any markdown formatting or code blocks.
        `;
        try {
            console.log("Generating skill test for career:", chosenCareer, "with prompt:", prompt);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
            console.log("Raw skill test response:", text);
            const parsedResponse = JSON.parse(text);
            console.log("Parsed skill test response:", parsedResponse);
            return parsedResponse;
        } catch (error) {
            console.error("Error generating skill test:", error);
            return null;
        }
    }
}

const assessment = new CareerAssessment(apiKey);

app.post('/generate-questions', async (req, res) => {
  const { userDescription } = req.body;
  if (!userDescription || typeof userDescription !== 'string' || userDescription.trim() === '') {
      console.log("Invalid user description", req.body);
      return res.status(400).json({ error: "User description is required and must be a non-empty string." });
  }
    try {
        console.log("Request to generate questions for description:", userDescription);
        const questions = await assessment._generateQuestions(userDescription);
        if (questions) {
            res.json(questions);
        } else {
            res.status(500).json({ error: "Failed to generate questions" });
        }
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ error: "Failed to generate questions" });
    }
});


app.post('/generate-recommendations', async (req, res) => {
    const { traitScores, responses, userDescription } = req.body;
    if (!traitScores || typeof traitScores !== 'object' || Object.keys(traitScores).length === 0 ||
        !responses || typeof responses !== 'object' || Object.keys(responses).length === 0 ||
        !userDescription || typeof userDescription !== 'string' || userDescription.trim() === '') {
        console.log("Invalid parameters:", req.body);
        return res.status(400).json({ error: "Missing or invalid required parameters." });
    }
    try {
        console.log("Request to generate recommendations with trait scores:", traitScores, "and responses:", responses,"and description",userDescription );
        const recommendations = await assessment._generateRecommendations(traitScores, responses, userDescription);
         if (recommendations) {
                res.json(recommendations);
            } else {
                res.status(500).json({ error: "Failed to generate recommendations" });
            }
    } catch (error) {
        console.error("Error generating recommendations:", error);
        res.status(500).json({ error: "Failed to generate recommendations" });
    }
});

app.post('/test-skills', async (req, res) => {
    const { chosenCareer } = req.body;
    if (!chosenCareer || typeof chosenCareer !== 'string' || chosenCareer.trim() === '') {
        console.log("Invalid chosen career:", req.body);
        return res.status(400).json({ error: "Career choice is required and must be a non-empty string." });
    }
    try {
        console.log("Request to generate skill test for career:", chosenCareer);
        const skillTest = await assessment._testSkills(chosenCareer);
        if (skillTest) {
                res.json(skillTest);
        } else {
            res.status(500).json({ error: "Failed to generate skill test" });
        }
    } catch (error) {
        console.error("Error generating skill test:", error);
        res.status(500).json({ error: "Failed to generate skill test" });
    }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});