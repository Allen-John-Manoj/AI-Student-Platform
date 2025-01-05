import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainMenu = ({ recommendations }) => {
  const navigate = useNavigate();

  const handleTestSkills = () => {
    navigate('/skill-test');
  };

  return (
    <div className="container mx-auto py-8 text-center">
      <h2 className="text-3xl font-bold mb-8">Main Menu</h2>

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Options:</h3>
        <ul className="list-none pl-0">
            { recommendations && recommendations.career_paths && (
                <li className="mb-2">
                    <button
                        onClick={handleTestSkills}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Test Your Skills
                    </button>
                </li>
            )}

          { recommendations && recommendations.learning_resources && (
              <li className="mb-2">
                  <button
                    onClick={() => navigate('/career-resources')}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                      Explore Career Resources
                  </button>
              </li>
          )}
          <li>
            <button
              onClick={() => navigate('/')}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Exit
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MainMenu;