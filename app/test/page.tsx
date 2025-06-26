export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Campus Cheers Test
        </h1>
        <p className="text-gray-600 mb-6">
          If you can see this page, the app is working correctly!
        </p>
        <div className="space-y-4">
          <button className="btn-primary w-full">
            Primary Button Test
          </button>
          <button className="btn-secondary w-full">
            Secondary Button Test
          </button>
        </div>
        <div className="mt-6">
          <div className="poll-option">
            <span>Poll Option Test</span>
          </div>
        </div>
      </div>
    </div>
  );
} 