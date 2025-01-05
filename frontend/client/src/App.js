import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AssessmentForm from './components/AssessmentForm';
import CareerRecommendations from './components/CareerRecommendations';
import SkillTest from './components/SkillTest';
import Loading from './components/Loading';
import axios from 'axios';

function App() {
    const [questions, setQuestions] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [traitScores, setTraitScores] = useState({});
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleQuestionsReceived = async (questionsData) => {
        setQuestions(questionsData);
        setResponses({});
         const initialTraitScores = {};
        if (questionsData && questionsData.areas) {
            for (const area of Object.values(questionsData.areas)) {
                area.questions.forEach(q => {
                    q.category.forEach(cat => {
                        initialTraitScores[cat] = 0;
                    });
                });
            }
        }
        setTraitScores(initialTraitScores);
        navigate('/assessment');
    };

    const handleAnswerSelect = (area, questionIndex, selectedOption) => {
          if (!questions) {
              console.log("No questions loaded");
              return;
          }
        console.log("handleAnswerSelect called with:", area, questionIndex, selectedOption);
        setResponses(prevResponses => {
            const updatedResponses = { ...prevResponses };
            if (!updatedResponses[area]) {
                updatedResponses[area] = [];
            }
          // Deep copy and update
            const updatedAreaResponses = [...updatedResponses[area]];
            updatedAreaResponses[questionIndex] = selectedOption;
            updatedResponses[area] = updatedAreaResponses
              console.log("Updated responses:", updatedResponses);
            return updatedResponses;
        });


         const currentQuestion = questions.areas[area].questions[questionIndex];
      const traitIndex = selectedOption.charCodeAt(0) - 'A'.charCodeAt(0);
      const category = currentQuestion.category[traitIndex];

      setTraitScores(prevTraitScores => {
            const updatedScores = { ...prevTraitScores };
            updatedScores[category] += 1;
            return updatedScores;
        });

    };


    const handleRecommendationRequest = async (userDescription) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:5000/generate-recommendations', {
                traitScores, responses, userDescription
            });
            if (response.data) {
                setRecommendations(response.data);
                localStorage.setItem('recommendations', JSON.stringify(response.data));
                navigate('/recommendations');
            } else {
                setError('Failed to fetch recommendations.');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch recommendations.');
            console.error("Error fetching recommendations", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500 text-2xl">{error}</p>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<AssessmentForm onQuestionsReceived={handleQuestionsReceived} />} />
            <Route
                path="/assessment"
                element={
                    questions ? (
                        <AssessmentPage
                            questions={questions}
                            onAnswerSelect={handleAnswerSelect}
                            onRecommendationsRequest={handleRecommendationRequest}
                            responses={responses}
                        />
                    ) : (
                        <p className="text-center mt-4">No questions available.</p>
                    )
                }
            />
            <Route path="/recommendations"
                   element={<CareerRecommendations recommendations={recommendations} />} />
            <Route path="/skill-test" element={<SkillTest/>}/>
        </Routes>
    );
}



const AssessmentPage = ({ questions, onAnswerSelect, onRecommendationsRequest, responses }) => {
    const [userDescription, setUserDescription] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const isOptionSelected = (area, questionIndex, optionKey) => 
        responses?.[area]?.[questionIndex] === optionKey;

    const handleRecommendationsRequest = async () => {
        if (!userDescription.trim()) {
            setError("Please provide a brief description about yourself.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await onRecommendationsRequest(userDescription);
        } catch (err) {
            console.error("Error fetching recommendations:", err);
            setError("Failed to get recommendations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-3xl font-bold text-center mb-8">Answer the Questions</h2>
            {Object.entries(questions.areas).map(([area, content]) => (
                <div key={area} className="bg-white shadow-md rounded p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4">{area.toUpperCase()}</h3>
                    {content.questions.map((question, questionIndex) => (
                        <div key={questionIndex} className="mb-4">
                            <p className="text-lg mb-2">{question.question}</p>
                            <div className="flex flex-col">
                                {Object.entries(question.options).map(([optionKey, optionValue]) => (
                                    <button
                                        key={optionKey}
                                        onClick={() => onAnswerSelect(area, questionIndex, optionKey)}
                                        className={`border rounded px-4 py-2 mb-2 text-left transition-colors ${
                                            isOptionSelected(area, questionIndex, optionKey)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                    >
                                        {optionKey}: {optionValue}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userDescription">
                    Provide a brief description about you.
                </label>
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="userDescription"
                    placeholder="A brief summary about yourself"
                    value={userDescription}
                    onChange={(e) => {
                        setUserDescription(e.target.value);
                        setError(null); // Clear error on input change
                    }}
                    required
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <div className="flex justify-center">
                <button
                    onClick={handleRecommendationsRequest}
                    className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors ${
                        loading
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-700 text-white'
                    }`}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Get Career Recommendations'}
                </button>
            </div>
        </div>
    );
};


export default App;