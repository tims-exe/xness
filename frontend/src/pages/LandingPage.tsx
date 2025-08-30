import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-semibold text-gray-800 mb-4">xness</h1>
        </div>
        <button
          onClick={() => navigate('/signin')}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-md transition-colors duration-200"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;