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
    "The silent giggler", 
    "The belly laugher",
    "The one who laughs at everything"
  ],
  scheduledFor: new Date()
};

// Mock database
const mockDatabase = {
  users: new Map<string, User>(),
  responses: new Map<string, any>(),
  
  createUser: (email: string): User => {
    const user = { id: `user-${Date.now()}`, email };
    mockDatabase.users.set(user.id, user);
    return user;
  },
  
  submitResponse: (pollId: string, userId: string, option: string, videoUrl: string) => {
    const response = { pollId, userId, option, videoUrl, timestamp: new Date() };
    mockDatabase.responses.set(`${pollId}-${userId}`, response);
  },
  
  getPollResults: (pollId: string): PollResult => {
    const responses = Array.from(mockDatabase.responses.values()).filter(r => r.pollId === pollId);
    const totalResponses = responses.length;
    
    const optionCounts: Record<string, number> = {};
    mockPoll.options.forEach(option => {
      optionCounts[option] = 0;
    });
    
    responses.forEach(response => {
      optionCounts[response.option]++;
    });
    
    const optionPercentages: Record<string, number> = {};
    mockPoll.options.forEach(option => {
      optionPercentages[option] = totalResponses > 0 ? (optionCounts[option] / totalResponses) * 100 : 0;
    });
    
    return {
      pollId,
      totalResponses,
      optionCounts,
      optionPercentages
    };
  }
};

type AppState = 'welcome' | 'poll' | 'recording' | 'results' | 'waiting';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [appState, setAppState] = useState<AppState>('welcome');
  const [isPollActive, setIsPollActive] = useState(false);
  const [pollResults, setPollResults] = useState<PollResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [email, setEmail] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('campus_cheers_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setAppState('poll');
    }
  }, []);

  // Poll timer logic
  useEffect(() => {
    if (appState === 'poll' && isPollActive) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handlePollExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [appState, isPollActive]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      const newUser = mockDatabase.createUser(email);
      setUser(newUser);
      localStorage.setItem('campus_cheers_user', JSON.stringify(newUser));
      setAppState('poll');
    }
  };

  const handleVote = (option: string) => {
    setSelectedOption(option);
    setAppState('recording');
  };

  const handleRecordingComplete = () => {
    if (!user || !selectedOption) return;
    
    // Mock video URL
    const videoUrl = 'mock-video-url';
    
    // Submit response
    mockDatabase.submitResponse(mockPoll.id, user.id, selectedOption, videoUrl);
    
    // Get results
    const results = mockDatabase.getPollResults(mockPoll.id);
    setPollResults(results);
    setAppState('results');
  };

  const handleRecordingCancel = () => {
    setSelectedOption('');
    setAppState('poll');
  };

  const handlePollExpire = () => {
    setIsPollActive(false);
    const results = mockDatabase.getPollResults(mockPoll.id);
    setPollResults(results);
    setAppState('results');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((120 - timeLeft) / 120) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {appState === 'welcome' && (
        <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-red-400 flex items-center justify-center p-4">
          <div className="card max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-3xl">🎉</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Campus Cheers
              </h1>
              <p className="text-gray-600 text-lg">
                Spread positivity, one poll at a time
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@school.edu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Get Started
              </button>
            </form>

            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
                Why Campus Cheers?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">100% anonymous voting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Positive, uplifting questions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Quick 2-minute daily polls</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {appState === 'poll' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {isPollActive ? (
              <>
                <div className="text-center mb-6">
                  <div className="countdown-timer mb-4">
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-gray-600 mb-4">Submit your vote + selfie before time runs out!</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="card">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white text-2xl">🎉</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Today's Cheer Poll
                    </h2>
                    <p className="text-gray-600">
                      Spread some positivity! Vote anonymously and share your selfie.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                      {mockPoll.question}
                    </h3>
                  </div>

                  <div className="space-y-3 mb-6">
                    {mockPoll.options.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => handleVote(option)}
                        className={`poll-option ${selectedOption === option ? 'selected' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{option}</span>
                          {selectedOption === option && (
                            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedOption && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-green-500 text-lg">✅</span>
                        <div>
                          <p className="font-medium text-green-800">
                            Great choice! Now record your selfie to complete your vote.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="card text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse-slow">
                  <span className="text-white text-2xl">⏰</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Poll Starts Soon!
                </h2>
                <p className="text-gray-600 mb-6">
                  Today's poll will be available at 1:00 PM
                </p>
                <button 
                  onClick={() => {
                    setIsPollActive(true);
                    setTimeLeft(120);
                  }}
                  className="btn-primary"
                >
                  Start Poll Now (Demo)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {appState === 'recording' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card max-w-md w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Record Your Selfie
              </h2>
              <p className="text-gray-600">
                Record a quick 3-5 second video to complete your vote!
              </p>
            </div>

            <div className="mb-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-600 text-2xl">📹</span>
                  </div>
                  <p className="text-gray-600">Camera preview will appear here</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={handleRecordingComplete} className="btn-primary w-full">
                ✅ Submit Vote (Demo)
              </button>
              <button onClick={handleRecordingCancel} className="btn-secondary w-full">
                Cancel
              </button>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Recording Tips:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Make sure you're in a well-lit area</li>
                <li>• Keep your face clearly visible</li>
                <li>• Record for 3-5 seconds</li>
                <li>• Be yourself and have fun! 😊</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {appState === 'results' && pollResults && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Today's Results
              </h2>
              <p className="text-gray-600">
                Anonymous results from your school
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                {mockPoll.question}
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              {mockPoll.options.map((option, index) => {
                const percentage = pollResults.optionPercentages[option] || 0;
                const count = pollResults.optionCounts[option] || 0;
                const isWinner = index === 0 && percentage > 0;

                return (
                  <div
                    key={option}
                    className={`relative p-4 rounded-lg border-2 ${
                      isWinner 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {isWinner && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                        🏆 Winner
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800 flex-1 pr-4">
                        {option}
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="text-sm text-gray-500 mt-1">
                      {count} vote{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-red-600">
                  {pollResults.totalResponses}
                </span> students participated today
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-400 rounded-lg p-4 text-center">
              <div className="text-white">
                <p className="font-semibold text-lg mb-1">
                  🎉 Amazing participation!
                </p>
                <p className="text-sm opacity-90">
                  You helped spread positivity across your campus today!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 