'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SelfieRecorderProps } from '@/lib/types';

export default function SelfieRecorder({ onRecordingComplete, onCancel }: SelfieRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setIsRecording(false);
        setRecordingTime(0);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 5) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
      
    } catch (err) {
      setError('Unable to access camera. Please check permissions and try again.');
      console.error('Error accessing camera:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const retakeRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setError(null);
  };

  const submitRecording = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
    }
  };

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-satoshi mb-2">
          Record Your Selfie
        </h2>
        <p className="text-gray-600">
          Record a quick 3-5 second video to complete your vote!
        </p>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Video preview/recording area */}
      <div className="relative mb-6">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
          {!recordedBlob ? (
            <div className="w-full h-full flex items-center justify-center">
              {isRecording ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                    <span className="text-white text-2xl">●</span>
                  </div>
                  <p className="text-gray-600">Recording...</p>
                  <p className="text-viva-magenta font-bold text-lg">
                    {formatTime(recordingTime)}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-600 text-2xl">📹</span>
                  </div>
                  <p className="text-gray-600">Camera preview will appear here</p>
                </div>
              )}
            </div>
          ) : (
            <video
              src={URL.createObjectURL(recordedBlob)}
              controls
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium"
          >
            REC
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {!recordedBlob ? (
          <div className="flex space-x-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="btn-primary flex-1"
                disabled={isRecording}
              >
                🎬 Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="btn-secondary flex-1"
              >
                ⏹️ Stop Recording
              </button>
            )}
            <button
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={submitRecording}
              className="btn-primary flex-1"
            >
              ✅ Submit Vote
            </button>
            <button
              onClick={retakeRecording}
              className="btn-secondary"
            >
              🔄 Retake
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Recording Tips:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Make sure you're in a well-lit area</li>
          <li>• Keep your face clearly visible</li>
          <li>• Record for 3-5 seconds</li>
          <li>• Be yourself and have fun! 😊</li>
        </ul>
      </div>
    </motion.div>
  );
} 