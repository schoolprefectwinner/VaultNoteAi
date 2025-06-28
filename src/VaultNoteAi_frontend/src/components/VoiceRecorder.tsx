import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { gsap } from 'gsap';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onAudioReady: (blob: Blob) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscription,
  onAudioReady,
}) => {
  const { recording, startRecording, stopRecording, resetRecording } = useVoiceRecording();
  const [isPlaying, setIsPlaying] = useState(false);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recording.audioBlob) {
      onAudioReady(recording.audioBlob);
    }
  }, [recording.audioBlob, onAudioReady]);

  useEffect(() => {
    if (recording.isRecording && buttonRef.current) {
      // Recording pulse animation
      gsap.to(buttonRef.current, {
        scale: 1.1,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });

      // Status text animation
      if (statusRef.current) {
        gsap.to(statusRef.current, {
          opacity: 0.7,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut"
        });
      }
    } else if (buttonRef.current) {
      gsap.killTweensOf(buttonRef.current);
      gsap.to(buttonRef.current, { 
        scale: 1, 
        duration: 0.3,
        ease: "back.out(1.7)"
      });

      if (statusRef.current) {
        gsap.killTweensOf(statusRef.current);
        gsap.to(statusRef.current, { opacity: 1, duration: 0.3 });
      }
    }
  }, [recording.isRecording]);

  useEffect(() => {
    // Animate waveform bars
    if (waveformRef.current && recording.isRecording) {
      const bars = waveformRef.current.children;
      Array.from(bars).forEach((bar, index) => {
        const height = Math.max(4, recording.waveformData[index] * 50);
        gsap.to(bar, {
          height: `${height}px`,
          duration: 0.1,
          ease: "power2.out"
        });
      });
    }
  }, [recording.waveformData, recording.isRecording]);

  useEffect(() => {
    // Show controls when recording is done
    if (recording.duration > 0 && !recording.isRecording && controlsRef.current) {
      gsap.fromTo(controlsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" }
      );
    }
  }, [recording.duration, recording.isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordingToggle = () => {
    if (recording.isRecording) {
      stopRecording();
      
      // Stop animation
      if (buttonRef.current) {
        gsap.to(buttonRef.current, {
          scale: 0.9,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
      }
    } else {
      startRecording();
      
      // Start animation
      if (buttonRef.current) {
        gsap.fromTo(buttonRef.current,
          { scale: 1 },
          { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }
        );
      }
    }
  };

  const handleReset = () => {
    resetRecording();
    setIsPlaying(false);
    
    // Reset animation
    if (controlsRef.current) {
      gsap.to(controlsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Add play/pause logic here if needed
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Recording Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleRecordingToggle}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative overflow-hidden ${
            recording.isRecording
              ? 'bg-gradient-to-br from-error-500 to-error-600 shadow-error-500/30'
              : 'bg-gradient-to-br from-primary-500 to-accent-500 shadow-primary-500/30 hover:shadow-primary-500/50'
          }`}
        >
          {recording.isRecording ? (
            <Square className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
          
          {/* Ripple effect */}
          {recording.isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
          )}
        </button>

        {/* Recording indicator */}
        {recording.isRecording && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-error-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Duration Display */}
      {(recording.isRecording || recording.duration > 0) && (
        <div 
          ref={durationRef}
          className="text-2xl font-mono font-bold text-gray-700 dark:text-gray-300 bg-white/20 dark:bg-gray-800/20 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/30"
        >
          {formatDuration(recording.duration)}
        </div>
      )}

      {/* Waveform Visualization */}
      {recording.isRecording && (
        <div 
          ref={waveformRef}
          className="flex items-center justify-center space-x-1 h-16 px-8 py-4 bg-white/10 dark:bg-gray-800/10 rounded-2xl backdrop-blur-sm border border-white/20"
        >
          {Array.from({ length: 32 }, (_, index) => (
            <div
              key={index}
              className="bg-gradient-to-t from-primary-400 to-accent-400 rounded-full transition-all duration-100"
              style={{
                width: '3px',
                height: '4px',
                animationDelay: `${index * 50}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Playback Controls */}
      {recording.duration > 0 && !recording.isRecording && (
        <div 
          ref={controlsRef}
          className="flex items-center space-x-4 bg-white/20 dark:bg-gray-800/20 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/30"
        >
          <button
            onClick={handlePlayPause}
            className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Status Text */}
      <div 
        ref={statusRef}
        className="text-center"
      >
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {recording.isRecording 
            ? 'Recording in progress...' 
            : recording.duration > 0 
              ? 'Recording complete' 
              : 'Click to start voice recording'
          }
        </p>
        {recording.duration > 0 && !recording.isRecording && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Use playback controls or reset to record again
          </p>
        )}
      </div>
    </div>
  );
};