import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { totalMarks, totalQuestions } = location.state || { totalMarks: 0, totalQuestions: 0 };

    const handleRetakeTest = () => {
        navigate('/skill-test'); // Adjust the route name if needed
    };

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-3xl font-bold text-center mb-8">Results</h2>
            <div className="bg-white shadow-md rounded p-6 text-center">
                <h3 className="text-xl font-semibold mb-4">
                    Your Score: {totalMarks} / {totalQuestions}
                </h3>
                <p className="text-gray-700 mb-6">
                    Thank you for completing the skill test! You can retake the test for another career path or review the questions.
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={handleRetakeTest}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Retake Skill Test
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
