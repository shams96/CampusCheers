'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CountdownTimerProps } from '@/lib/types';

export default function CountdownTimer({ targetTime, onExpire, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        onExpire();
        return;
      }

      setTimeLeft(difference);
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onExpire]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    };
  };

  const { minutes, seconds } = formatTime(timeLeft);
  const progress = Math.max(0, Math.min(100, (timeLeft / (2 * 60 * 1000)) * 100));

  if (isExpired) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-center ${className}`}
      >
        <div className="countdown-timer text-red-500">
          Time's Up!
        </div>
        <p className="text-gray-600 mt-2">Poll has closed</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`text-center ${className}`}
    >
      <div className="mb-4">
        <div className="countdown-timer">
          {minutes}:{seconds}
        </div>
        <p className="text-gray-600 mt-2">Submit your vote + selfie before time runs out!</p>
      </div>
      
      {/* Progress bar */}
      <div className="progress-bar w-full mb-4">
        <motion.div
          className="progress-fill"
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      {/* Warning when time is running low */}
      {timeLeft <= 30000 && timeLeft > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg"
        >
          ⚠️ Less than 30 seconds left!
        </motion.div>
      )}

      {/* Urgency indicators */}
      {timeLeft <= 60000 && timeLeft > 30000 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-orange-600 font-medium"
        >
          ⏰ Hurry up! Time is running out!
        </motion.div>
      )}
    </motion.div>
  );
} 