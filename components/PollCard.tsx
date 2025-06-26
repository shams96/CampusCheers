'use client';

import { motion } from 'framer-motion';
import { PollCardProps } from '@/lib/types';

export default function PollCard({ poll, onVote, selectedOption, isSubmitting }: PollCardProps) {
  const handleOptionClick = (option: string) => {
    if (!isSubmitting && !selectedOption) {
      onVote(option);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-gradient-to-br from-viva-magenta to-magenta-light rounded-full mx-auto mb-4 flex items-center justify-center"
        >
          <span className="text-white text-2xl">🎉</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 font-satoshi mb-2">
          Today's Cheer Poll
        </h2>
        <p className="text-gray-600">
          Spread some positivity! Vote anonymously and share your selfie.
        </p>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          {poll.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {poll.options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleOptionClick(option)}
            className={`poll-option ${
              selectedOption === option ? 'selected' : ''
            } ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">{option}</span>
              {selectedOption === option && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-viva-magenta rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-sm">✓</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      {!selectedOption && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-blue-500 text-lg">💡</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">How it works:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Choose your answer above</li>
                <li>• Record a quick 3-5 second selfie</li>
                <li>• Submit before the 2-minute timer expires</li>
                <li>• See anonymous results from your school</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected state */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center space-x-3">
            <span className="text-green-500 text-lg">✅</span>
            <div>
              <p className="font-medium text-green-800">
                Great choice! Now record your selfie to complete your vote.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4"
        >
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-viva-magenta"></div>
            <span className="text-gray-600">Processing your vote...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 