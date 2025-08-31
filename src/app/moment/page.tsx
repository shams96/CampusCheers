'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import axios from 'axios';

// BeReal-style timing constants
const CAPTURE_TIME_WINDOW = 2 * 60 * 1000; // 2 minutes in milliseconds
const WARNING_TIME = 30 * 1000; // Show warning at 30 seconds remaining

export default function MomentPage() {
  const router = useRouter();

  // Camera refs
  const frontVideoRef = useRef<HTMLVideoElement>(null);
  const backVideoRef = useRef<HTMLVideoElement>(null);

  // State
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes
  const [captureStartTime, setCaptureStartTime] = useState<Date | null>(null);
  const [streak, setStreak] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [streams, setStreams] = useState<{front?: MediaStream, back?: MediaStream}>({});

  // Countdown timer for 2-minute window
  useEffect(() => {
    if (!captureStartTime || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - captureStartTime.getTime();
      const remaining = Math.max(0, Math.floor((CAPTURE_TIME_WINDOW - elapsed) / 1000));

      setTimeRemaining(remaining);
      setShowWarning(remaining <= WARNING_TIME / 1000 && remaining > 0);

      if (remaining <= 0) {
        // Time's up! Auto-capture
        handleForceCapture();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [captureStartTime, timeRemaining]);

  const startCapturing = useCallback(async () => {
    try {
      const startTime = new Date();
      setCaptureStartTime(startTime);
      setIsCapturing(true);

      // Start both cameras simultaneously
      await initializeCameras();
    } catch (err) {
      console.error('Error starting capture:', err);
      alert('Could not start camera capture. Please check permissions.');
    }
  }, []);

  const initializeCameras = async () => {
    try {
      // Back camera (main view)
      const backStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      // Front camera (selfie view)
      const frontStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });

      if (backVideoRef.current) {
        backVideoRef.current.srcObject = backStream;
      }

      if (frontVideoRef.current) {
        frontVideoRef.current.srcObject = frontStream;
      }

      setStreams({ back: backStream, front: frontStream });
    } catch (err) {
      console.error('Error initializing cameras:', err);
      throw err;
    }
  };


  const capturePhoto = (videoElement: HTMLVideoElement): string | null => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.9); // Higher quality
    }
    return null;
  };

  const handleForceCapture = async () => {
    await captureBothImages();
  };

  const captureBothImages = async () => {
    try {
      setIsCapturing(false);

      // Capture both cameras simultaneously
      const backImg = capturePhoto(backVideoRef.current!);
      const frontImg = capturePhoto(frontVideoRef.current!);

      if (backImg && frontImg) {
        setBackImage(backImg);
        setFrontImage(frontImg);

        // Stop camera streams
        Object.values(streams).forEach(stream => {
          stream?.getTracks().forEach(track => track.stop());
        });

        // Auto-save after capture
        await saveMoment(backImg, frontImg);
      } else {
        alert('Failed to capture photos. Please try again.');
      }
    } catch (error) {
      console.error('Error during capture:', error);
      alert('Error capturing moment.');
    }
  };

  const saveMoment = async (backImg: string, frontImg: string) => {
    try {
      const response = await axios.post('http://localhost:3001/api/moment', {
        userId: 'cmetfbkev000jiea4juya75nj', // Replace with actual user ID from auth
        frontImage: frontImg,
        backImage: backImg,
        caption: 'My Cheers Moment!',
        captureTime: captureStartTime?.toISOString(),
        timeRemaining,
        isLate: timeRemaining <= 0
      });

      setStreak(prev => prev + 1); // Update streak UI

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000); // Brief success screen

    } catch (error) {
      console.error('Error saving moment:', error);
      alert('Failed to save moment.');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md aspect-[9/16] bg-neutral-900 rounded-lg overflow-hidden relative">
        {/* Starting Screen */}
        {!isCapturing && !backImage ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">📸</div>
              <h1 className="text-2xl font-bold mb-2">Time for your Cheers Moment!</h1>
              <p className="text-gray-300 text-sm mb-4">You have 2 minutes to capture your authentic moment</p>
              {streak > 0 && (
                <div className="text-hype-blue-400 text-sm mb-4">
                  🔥 {streak} day streak! Keep it up!
                </div>
              )}
            </div>
            <Button
              primary
              size="large"
              label="Start Capture"
              onClick={startCapturing}
            />
          </div>
        ) : null}

        {/* Capture Screen */}
        {isCapturing && !backImage ? (
          <>
            {/* Main Camera (Back) */}
            <video
              ref={backVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />

            {/* Front Camera Preview */}
            <div className="absolute top-4 left-4 w-20 h-28 bg-neutral-800 rounded-md border-2 border-white overflow-hidden">
              <video
                ref={frontVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>

            {/* Timer and Controls */}
            <div className="absolute top-4 right-4 bg-black/70 px-3 py-2 rounded-full">
              <div className={`text-lg font-mono font-bold ${
                showWarning ? 'text-red-400 animate-pulse' :
                timeRemaining <= 30 ? 'text-yellow-400' : 'text-white'
              }`}>
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Warning Message */}
            {showWarning && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                Quick! Capture your moment! ⚡
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <Button
                primary
                size="large"
                label="Capture Moment!"
                onClick={captureBothImages}
              />
            </div>
          </>
        ) : null}

        {/* Success Screen */}
        {backImage && frontImage ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex space-x-2 mb-6">
              <img
                src={backImage}
                alt="Back camera"
                className="w-20 h-28 rounded object-cover border-2 border-white"
              />
              <img
                src={frontImage}
                alt="Front camera"
                className="w-20 h-28 rounded object-cover border-2 border-hype-blue-400"
              />
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-xl font-bold mb-2">Cheers Moment Captured!</h2>
              <p className="text-gray-300 text-sm">Sharing with your school community...</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-gray-400 text-sm px-6">
        <p>• Capture your authentic moment in 2 minutes</p>
        <p>• Both cameras capture simultaneously</p>
        <p>• Your moment stays private within your school</p>
      </div>
    </main>
  );
};
