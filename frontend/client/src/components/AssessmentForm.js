import React, { useState } from 'react';
import axios from 'axios';
import Loading from './Loading';

const AssessmentForm = ({ onQuestionsReceived }) => {
    const [userDescription, setUserDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:5000/generate-questions', { userDescription });
            if (response.data) {
                onQuestionsReceived(response.data);
            } else {
                setError("Failed to fetch questions. Please try again.");
            }
        } catch (err) {
            setError(err.message || "Failed to fetch questions. Please try again.");
            console.error("Error fetching questions", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Start Career Assessment</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userDescription">
                            Tell us about yourself
                        </label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="userDescription"
                            placeholder="Your background, interests, and what you're looking for in a career."
                            value={userDescription}
                            onChange={(e) => setUserDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Get Questions'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
            </div>
            {loading && <Loading/>}
        </div>
    );
};

export default AssessmentForm;