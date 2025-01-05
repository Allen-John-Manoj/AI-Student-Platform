import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';

const SkillTest = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const recommendations = localStorage.getItem('recommendations') ? JSON.parse(localStorage.getItem('recommendations')) : null;

    useEffect(() => {
        if (!recommendations || !recommendations.career_paths || recommendations.career_paths.length === 0) {
            navigate('/')
            return;
        }
        setLoading(true);
        const fetchSkillTest = async () => {
            const chosenCareer = recommendations.career_paths[0].title;
            try {
                const response = await axios.post('http://localhost:5000/test-skills', { chosenCareer });
                if (response.data){
                    setQuestions(response.data);
                } else {
                    setError('Failed to fetch skill test.')
                }

            } catch (err) {
                setError(err.message || 'Failed to fetch skill test.');
                console.error("Error fetching skill test", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSkillTest();
    }, [navigate, recommendations]);

    const handleAnswerSelect = (answer) => {
        setUserAnswers({ ...userAnswers, [currentQuestionIndex]: answer });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            navigate('/results');
        }
    };
    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };
    if (loading) return <Loading/>
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500 text-2xl">{error}</p>
            </div>
        );
    }

    if (!questions || questions.length === 0) {
        return <div className="flex justify-center items-center h-screen">
            <p className="text-gray-700 text-xl">No skill test data found</p>
        </div>
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-3xl font-bold text-center mb-8">Skill Test</h2>
            <div className="bg-white shadow-md rounded p-6">
                <h3 className="text-xl font-semibold mb-4">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                <p className="text-lg mb-4">{currentQuestion.question}</p>
                <div className="mb-6">
                    {Object.entries(currentQuestion.options).map(([key, option]) => (
                        <button
                            key={key}
                            onClick={() => handleAnswerSelect(key)}
                            className={`block w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-4 py-2 mb-2 text-left ${
                                userAnswers[currentQuestionIndex] === key ? 'bg-blue-200' : ''
                            }`}
                        >
                            {key}: {option}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between">
                    {currentQuestionIndex > 0 && (
                        <button
                            onClick={handlePreviousQuestion}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Previous
                        </button>
                    )}
                    <button
                        onClick={handleNextQuestion}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={!userAnswers[currentQuestionIndex]}
                    >
                        {currentQuestionIndex === questions.length - 1 ? 'View Results' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkillTest;