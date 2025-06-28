import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Square, Play, Pause, RotateCcw, Globe, Volume2, AlertCircle, CheckCircle } from 'lucide-react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { gsap } from 'gsap';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onAudioReady: (blob: Blob) => void;
  onLiveTranscription?: (text: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-PT', name: 'Portuguese' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'hi-IN', name: 'Hindi' },
];

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscription,
  onAudioReady,
  onLiveTranscription,
}) => {
  const { recording, startRecording, stopRecording, resetRecording, changeLanguage, isSupported } = useVoiceRecording();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const transcriptionRef = useRef<HTMLDivElement>(null);
  const liveTranscriptionRef = useRef<HTMLDivElement>(null);

  // Send live transcription to parent
  useEffect(() => {
    if (recording.liveTranscription && onLiveTranscription) {
      onLiveTranscription(recording.liveTranscription);
    }
  }, [recording.liveTranscription, onLiveTranscription]);

  // Send final transcription to parent
  useEffect(() => {
    if (recording.finalTranscription) {
      onTranscription(recording.finalTranscription);
    }
  }, [recording.finalTranscription, onTranscription]);

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
        const height = Math.max(4, (recording.waveformData[index] || 0) * 50);
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

  // Animate transcription updates
  useEffect(() => {
    if (liveTranscriptionRef.current && recording.liveTranscription) {
      gsap.fromTo(liveTranscriptionRef.current,
        { opacity: 0.5, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [recording.liveTranscription]);

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

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setShowLanguageSelector(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return CheckCircle;
    if (confidence >= 0.6) return AlertCircle;  
    return AlertCircle;
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center space-y-4 p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
            Speech Recognition Not Supported
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400">
            Your browser doesn't support real-time speech recognition. 
            Please use Chrome, Edge, or Safari for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Language Selector */}
      <div className="relative">
        <button
          onClick={() => setShowLanguageSelector(!showLanguageSelector)}
          className="flex items-center space-x-2 px-4 py-2 bg-white/20 dark:bg-gray-800/20 rounded-xl backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">
            {SUPPORTED_LANGUAGES.find(lang => lang.code === recording.language)?.name || 'English (US)'}
          </span>
        </button>
        
        {showLanguageSelector && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto z-10">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  recording.language === lang.code ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''
                }`}
              >
                <span className="text-sm font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

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

        {/* Recording indicator with listening status */}
        {recording.isRecording && (
          <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
            recording.isListening ? 'bg-green-500' : 'bg-error-500'
          }`}>
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

      {/* Live Transcription Display */}
      {recording.isRecording && (recording.liveTranscription || recording.finalTranscription) && (
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Live Transcription</span>
                {recording.isListening && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Listening</span>
                  </div>
                )}
              </div>
              
              {/* Confidence indicator */}
              {recording.confidence > 0 && (
                <div className="flex items-center space-x-2">
                  {React.createElement(getConfidenceIcon(recording.confidence), {
                    className: `w-4 h-4 ${getConfidenceColor(recording.confidence)}`
                  })}
                  <span className={`text-xs font-medium ${getConfidenceColor(recording.confidence)}`}>
                    {Math.round(recording.confidence * 100)}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {/* Final transcription */}
              {recording.finalTranscription && (
                <div ref={transcriptionRef} className="text-gray-900 dark:text-white leading-relaxed">
                  {recording.finalTranscription}
                </div>
              )}
              
              {/* Live transcription (interim results) */}
              {recording.liveTranscription && (
                <div 
                  ref={liveTranscriptionRef}
                  className="text-gray-600 dark:text-gray-400 italic border-l-2 border-primary-400 pl-4 bg-primary-50/50 dark:bg-primary-900/20 rounded-r-lg py-2"
                >
                  {recording.liveTranscription}
                </div>
              )}
            </div>
          </div>
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
              className={`rounded-full transition-all duration-100 ${
                recording.speechDetected
                  ? 'bg-gradient-to-t from-green-400 to-emerald-400'
                  : 'bg-gradient-to-t from-primary-400 to-accent-400'
              }`}
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
            ? recording.isListening 
              ? 'Listening and transcribing...' 
              : 'Recording audio...'
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
        {recording.isRecording && recording.finalTranscription && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {recording.finalTranscription.split(' ').length} words transcribed
          </p>
        )}
      </div>
    </div>
  );
};