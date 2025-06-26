'use client';

import { motion } from 'framer-motion';
import { ResultsScreenProps } from '@/lib/types';

export default function ResultsScreen({ results, poll }: ResultsScreenProps) {
  const sortedOptions = poll.options.sort((a, b) => 
    (results.option_percentages[b] || 0) - (results.option_percentages[a] || 0)
  );

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
          className="w-16 h-16 bg-gradient-to-br from-cheer-green to-green-400 rounded-full mx-auto mb-4 flex items-center justify-center"
        >
          <span className="text-white text-2xl">📊</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 font-satoshi mb-2">
          Today's Results
        </h2>
        <p className="text-gray-600">
          Anonymous results from your school
        </p>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {poll.question}
        </h3>
      </div>

      {/* Results */}
      <div className="space-y-4 mb-6">
        {sortedOptions.map((option, index) => {
          const percentage = results.option_percentages[option] || 0;
          const count = results.option_counts[option] || 0;
          const isWinner = index === 0 && percentage > 0;

          return (
            <motion.div
              key={option}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-lg border-2 ${
                isWinner 
                  ? 'border-cheer-yellow bg-yellow-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Winner badge */}
              {isWinner && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-cheer-yellow text-yellow-900 px-2 py-1 rounded-full text-xs font-bold"
                >
                  🏆 Winner
                </motion.div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800 flex-1 pr-4">
                  {option}
                </span>
                <span className="text-lg font-bold text-viva-magenta">
                  {percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  style={{
                    background: isWinner 
                      ? 'linear-gradient(to right, #FFD700, #FFA500)' 
                      : 'linear-gradient(to right, #BE3455, #D15A7A)'
                  }}
                />
              </div>

              <div className="text-sm text-gray-500 mt-1">
                {count} vote{count !== 1 ? 's' : ''}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total responses */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-50 rounded-lg p-4 text-center"
      >
        <p className="text-gray-600">
          <span className="font-semibold text-viva-magenta">
            {results.total_responses}
          </span> students participated today
        </p>
      </motion.div>

      {/* Positive message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 bg-gradient-to-r from-cheer-green to-green-400 rounded-lg p-4 text-center"
      >
        <div className="text-white">
          <p className="font-semibold text-lg mb-1">
            🎉 Amazing participation!
          </p>
          <p className="text-sm opacity-90">
            You helped spread positivity across your campus today!
          </p>
        </div>
      </motion.div>

      {/* Next poll reminder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-center space-x-3">
          <span className="text-blue-500 text-lg">⏰</span>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">
              Tomorrow's poll at 1:00 PM
            </h4>
            <p className="text-sm text-blue-700">
              Don't miss the next opportunity to spread cheer!
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 