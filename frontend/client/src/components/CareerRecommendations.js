import React from 'react';
import { useNavigate } from 'react-router-dom';

const CareerRecommendations = ({ recommendations }) => {
  const navigate = useNavigate();

  if (!recommendations) {
    return <p className="text-center mt-4">No recommendations available. Please complete the assessment.</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Your Career Recommendations</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Career Paths</h3>
        {recommendations.career_paths && recommendations.career_paths.map((path, index) => (
          <div key={index} className="bg-white shadow-md rounded p-4 mb-4">
            <h4 className="text-lg font-semibold">{path.title}</h4>
            <p className="text-gray-700 mb-2">{path.description}</p>
            <p className="text-gray-700">
              <span className="font-semibold">Required Skills:</span> {path.required_skills.join(', ')}
            </p>
          </div>
        ))}
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Learning Resources</h3>
        {recommendations.learning_resources && recommendations.learning_resources.map((resource, index) => (
          <div key={index} className="bg-white shadow-md rounded p-4 mb-4">
            <h4 className="text-lg font-semibold">{resource.type}</h4>
            <p className="text-gray-700">{resource.description}</p>
            <p className="text-gray-700">
              <span className="font-semibold">Where:</span> {resource.where}
            </p>
          </div>
        ))}
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
          {recommendations.next_steps && recommendations.next_steps.map((step, index) => (
             <li key={index} className="text-gray-700 mb-2 list-disc list-inside">{step}</li>
        ))}
        </div>
        <div className="text-center">
            <button onClick={()=> navigate("/skill-test")} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Test your Skills
            </button>
        </div>
    </div>
  );
};

export default CareerRecommendations;