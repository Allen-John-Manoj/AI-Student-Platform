import { GoogleGenerativeAI } from '@google/generative-ai';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

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

  async _testSkills(chosenCareer) {
    const prompt = `
    Generate 10 skill and knowledge-testing questions related to the career path ${chosenCareer}. The question should include the following:
    1. A multiple-choice question with 4 options labeled A, B, C, and D.
    2. Indicate the correct answer.
    3. Provide an explanation for why the correct answer is correct.
    4. If the user answers incorrectly, explain what was wrong with their answer and provide the correct answer.
    
    Return the response as a valid JSON object with the following structure:
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
    Do not include any markdown formatting or code blocks.
    `;
  
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
      const parsedResponse = JSON.parse(text);
      return parsedResponse;
    } catch (error) {
      console.error("Error generating skill test:", error);
      return null; // Return null to indicate failure
    }
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

    const recommendations = await this._generateRecommendations(traitScores, responses, userDescription);
    if (recommendations) {
      console.log("\nYour Career Recommendations:");
      console.log(JSON.stringify(recommendations, null, 2));
    } else {
      console.log("\nSorry, there was an error generating your recommendations.");
    }

    return recommendations;
  }

  async runSkillTest(chosenCareer) {
    console.log(`\n=== Test Your Skills for ${chosenCareer} ===`);
    const skillTest = await this._testSkills(chosenCareer);
    
    if (!skillTest || !Array.isArray(skillTest)) {
      console.error("\nNo valid skill test data received.");
      return;
    }
  
    // Loop through the questions in the skill test
    for (const q of skillTest) {
      console.log(`\n${q.question}`);
      Object.entries(q.options).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
  
      let answer;
      // Ensure that the user selects a valid option
      do {
        answer = (await this._getUserInput("\nYour answer (A/B/C/D): ")).toUpperCase();
      } while (!['A', 'B', 'C', 'D'].includes(answer));
  
      // Provide feedback on the answer
      if (answer === q.correct_answer) {
        console.log("\nCorrect! Well done.");
      } else {
        console.log(`\nIncorrect. The correct answer is ${q.correct_answer}: ${q.explanation}`);
      }
    }
  }
  
  

  async mainMenu(recommendations) {
    while (true) {
      console.log("\n=== Main Menu ===");
      console.log("1. Test Your Skills");
      console.log("2. Explore Career Resources (WIP)");
      console.log("3. Exit");

      const choice = await this._getUserInput("\nEnter your choice (1-3): ");

      switch (choice) {
        case '1':
          if (recommendations && recommendations.career_paths) {
            console.log("\nPlease select a career from the recommendations:");
            recommendations.career_paths.forEach((path, index) => {
              console.log(`${index + 1}. ${path.title}`);
            });

            const careerChoice = parseInt(await this._getUserInput("\nEnter the number of your chosen career: "), 10);
            if (careerChoice > 0 && careerChoice <= recommendations.career_paths.length) {
              const chosenCareer = recommendations.career_paths[careerChoice - 1].title;
              await this.runSkillTest(chosenCareer);
            } else {
              console.log("\nInvalid choice. Returning to the main menu.");
            }
          } else {
            console.log("\nNo career recommendations available. Please run the assessment first.");
          }
          break;

        case '2':
          if (recommendations && recommendations.learning_resources) {
            console.log("\n=== Career Resources ===");
            recommendations.learning_resources.forEach(resource => {
              console.log(`- ${resource.type}: ${resource.description} (${resource.where})`);
            });
          } else {
            console.log("\nNo resources available. Please run the assessment first.");
          }
          break;

        case '3':
          console.log("\nExiting. Thank you for using Career Assessment!");
          return;

        default:
          console.log("\nInvalid choice. Please try again.");
      }
    }
  }

  async start() {
    console.log("\n=== Running Career Assessment ===");
    const recommendations = await this.runAssessment();

    if (recommendations) {
      await this.mainMenu(recommendations);
    } else {
      console.log("\nUnable to generate recommendations. Exiting.");
    }
  }
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFile) {
  const apiKey = process.env.GOOGLE_API_KEY || "AIzaSyC0lHjL55wzQnp_no20DTTzJCNguNeL3Vo";
  const assessment = new CareerAssessment(apiKey);
  assessment.start().catch(console.error);
}

export default CareerAssessment;
