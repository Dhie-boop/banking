import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md text-center">
        {/* 404 Number */}
        <h1 className="text-9xl font-bold text-blue-800 mb-4">404</h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-800 hover:bg-blue-700 transition-colors"
          >
            <FiHome className="mr-2" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="ml-4 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
