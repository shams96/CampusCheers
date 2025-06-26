'use client';

import { useState, useEffect } from 'react';

// Simple types
interface User {
  id: string;
  email: string;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  scheduledFor: Date;
}

interface PollResult {
  pollId: string;
  totalResponses: number;
  optionCounts: Record<string, number>;
  optionPercentages: Record<string, number>;
}

// Mock data
const mockPoll: Poll = {
  id: 'poll-1',
  question: "Who has the most contagious laugh on campus?",
  options: [
    "The one who snorts when they laugh",
    "The one with the silent wheeze",
    "The one who sounds like a dolphin",
    "The one who does the full-body laugh"
  ],
  scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
};

export default function PollClient() {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [pollResults, setPollResults] = useState<PollResult | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [poll, setPoll] = useState<Poll>(mockPoll);

  // Initialize user
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setCurrentUser({ id: userEmail, email: userEmail });
    } else {
      const newEmail = `user-${Math.random().toString(36).substr(2, 9)}@example.com`;
      localStorage.setItem('userEmail', newEmail);
      setCurrentUser({ id: newEmail, email: newEmail });
    }
  }, []);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!selectedOption || !currentUser) return;
    
    try {
      // In a real app, you would upload the video and get a URL
      const mockVideoUrl = 'https://example.com/video.mp4';
      
      // Submit response
      console.log('Submitting response:', {
        pollId: poll.id,
        userId: currentUser.id,
        option: selectedOption,
        videoUrl: mockVideoUrl
      });
      
      // In a real app, you would call an API here
      // await submitResponse(poll.id, currentUser.id, selectedOption, mockVideoUrl);
      
      // Get updated results
      const results = getPollResults(poll.id);
      setPollResults(results);
      
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">
        {poll.question}
      </h1>
      
      <div className="space-y-4 mb-8">
        {poll.options.map((option, index) => (
          <div 
            key={index}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedOption === option 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => handleOptionSelect(option)}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                selectedOption === option 
                  ? 'border-indigo-500 bg-indigo-500' 
                  : 'border-gray-300'
              }`}>
                {selectedOption === option && (
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                )}
              </div>
              <span className="text-lg">{option}</span>
            </div>
            
            {pollResults && (
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500"
                  style={{ 
                    width: `${pollResults.optionPercentages[option] || 0}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className={`px-6 py-3 rounded-full font-medium text-white ${
            selectedOption 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-gray-400 cursor-not-allowed'
          } transition-colors`}
        >
          Submit Your Vote
        </button>
      </div>
      
      {pollResults && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Poll Results</h2>
          <div className="space-y-2">
            {poll.options.map((option, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between mb-1">
                  <span>{option}</span>
                  <span className="font-medium">
                    {pollResults.optionPercentages[option]?.toFixed(1) || 0}%
                    <span className="text-sm text-gray-500 ml-1">
                      ({pollResults.optionCounts[option] || 0} votes)
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Mock functions
function getPollResults(pollId: string): PollResult {
  // In a real app, this would be an API call
  const mockResults = {
    pollId,
    totalResponses: 42,
    optionCounts: {
      "The one who snorts when they laugh": 15,
      "The one with the silent wheeze": 10,
      "The one who sounds like a dolphin": 12,
      "The one who does the full-body laugh": 5
    },
    optionPercentages: {
      "The one who snorts when they laugh": 35.7,
      "The one with the silent wheeze": 23.8,
      "The one who sounds like a dolphin": 28.6,
      "The one who does the full-body laugh": 11.9
    }
  };
  
  return mockResults;
}

// This would be an API call in a real app
function submitResponse(pollId: string, userId: string, option: string, videoUrl: string) {
  console.log(`Response submitted:`, { pollId, userId, option, videoUrl });
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
}
