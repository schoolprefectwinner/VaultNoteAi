import { useState, useRef, useCallback, useEffect } from 'react';
import { VoiceRecording } from '../types';

// Extend the interface to include transcription
interface EnhancedVoiceRecording extends VoiceRecording {
  liveTranscription: string;
  finalTranscription: string;
  isListening: boolean;
  confidence: number;
  language: string;
  interimResults: string[];
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useVoiceRecording = () => {
  const [recording, setRecording] = useState<EnhancedVoiceRecording>({
    isRecording: false,
    duration: 0,
    waveformData: [],
    liveTranscription: '',
    finalTranscription: '',
    isListening: false,
    confidence: 0,
    language: 'en-US',
    interimResults: [],
  });
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number>();
  const durationInterval = useRef<number>();
  
  // Speech Recognition
  const recognition = useRef<any>(null);
  const finalTranscript = useRef<string>('');
  
  // Initialize Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      
      // Configure speech recognition
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = recording.language;
      recognition.current.maxAlternatives = 3;
      
      // Event handlers
      recognition.current.onstart = () => {
        console.log('🎤 Speech recognition started');
        setRecording(prev => ({ ...prev, isListening: true }));
      };
      
      recognition.current.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          console.log('🔇 No speech detected, continuing to listen...');
          return;
        }
        setRecording(prev => ({ ...prev, isListening: false }));
      };
      
      recognition.current.onend = () => {
        console.log('🎤 Speech recognition ended');
        setRecording(prev => ({ ...prev, isListening: false }));
        
        // Restart recognition if still recording
        if (recording.isRecording) {
          setTimeout(() => {
            if (recognition.current && recording.isRecording) {
              try {
                recognition.current.start();
              } catch (error) {
                console.log('Recognition restart delayed due to active session');
              }
            }
          }, 100);
        }
      };
      
      recognition.current.onresult = (event: any) => {
        let interimTranscript = '';
        let confidenceSum = 0;
        let confidenceCount = 0;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence || 0;
          
          if (result.isFinal) {
            finalTranscript.current += transcript + ' ';
            console.log('✅ Final transcript:', transcript);
            setRecording(prev => ({ 
              ...prev, 
              finalTranscription: finalTranscript.current.trim(),
            }));
          } else {
            interimTranscript += transcript;
            confidenceSum += confidence;
            confidenceCount++;
          }
        }
        
        const avgConfidence = confidenceCount > 0 ? confidenceSum / confidenceCount : 0;
        
        setRecording(prev => ({ 
          ...prev, 
          liveTranscription: interimTranscript,
          confidence: avgConfidence,
          interimResults: Array.from(event.results).map((r: any) => r[0].transcript)
        }));
        
        console.log('🔄 Live transcription:', interimTranscript);
      };
    } else {
      console.warn('⚠️ Speech Recognition not supported in this browser');
    }
    
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      console.log('🚀 Starting voice recording with live transcription...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          autoGainControl: true,
        },
      });

      stream.current = mediaStream;
      
      // Setup audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(mediaStream);
      analyser.current = audioContext.createAnalyser();
      analyser.current.fftSize = 256;
      analyser.current.smoothingTimeConstant = 0.8;
      source.connect(analyser.current);

      // Setup media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
        
      mediaRecorder.current = new MediaRecorder(mediaStream, { mimeType });
      
      audioChunks.current = [];
      finalTranscript.current = '';
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        setRecording(prev => ({ 
          ...prev, 
          audioBlob,
          finalTranscription: finalTranscript.current.trim()
        }));
        console.log('✅ Recording complete. Final transcription:', finalTranscript.current.trim());
      };

      mediaRecorder.current.start(100); // Collect data every 100ms
      
      // Start speech recognition
      if (recognition.current) {
        try {
          recognition.current.start();
        } catch (error) {
          console.warn('Speech recognition start delayed:', error);
          // Try again after a short delay
          setTimeout(() => {
            if (recognition.current) {
              try {
                recognition.current.start();
              } catch (retryError) {
                console.error('Failed to start speech recognition:', retryError);
              }
            }
          }, 500);
        }
      }
      
      setRecording(prev => ({ 
        ...prev, 
        isRecording: true,
        liveTranscription: '',
        finalTranscription: '',
        confidence: 0,
        interimResults: []
      }));
      
      // Start duration counter
      durationInterval.current = window.setInterval(() => {
        setRecording(prev => ({ ...prev, duration: prev.duration + 0.1 }));
      }, 100);
      
      updateWaveform();
      
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions and try again.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log('🛑 Stopping voice recording...');
    
    if (mediaRecorder.current && recording.isRecording) {
      mediaRecorder.current.stop();
    }
    
    if (recognition.current) {
      recognition.current.stop();
    }
    
    if (stream.current) {
      stream.current.getTracks().forEach(track => track.stop());
    }
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    
    setRecording(prev => ({ 
      ...prev, 
      isRecording: false,
      isListening: false,
      waveformData: [],
      liveTranscription: '',
      finalTranscription: finalTranscript.current.trim()
    }));
  }, [recording.isRecording]);

  const updateWaveform = useCallback(() => {
    if (!analyser.current || !recording.isRecording) return;

    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.current.getByteFrequencyData(dataArray);

    // Convert to normalized values for waveform with better sensitivity
    const waveformData = Array.from(dataArray)
      .slice(0, 32)
      .map(value => Math.min(1, value / 128)); // More sensitive detection
    
    // Calculate noise level for speech detection
    const noiseLevel = waveformData.reduce((sum, val) => sum + val, 0) / waveformData.length;
    const speechDetected = noiseLevel > 0.01; // Threshold for speech detection
    
    setRecording(prev => ({ 
      ...prev, 
      waveformData,
      noiseLevel,
      speechDetected
    }));

    animationFrame.current = requestAnimationFrame(updateWaveform);
  }, [recording.isRecording]);

  const resetRecording = useCallback(() => {
    console.log('🔄 Resetting recording...');
    
    if (recognition.current) {
      recognition.current.stop();
    }
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    
    finalTranscript.current = '';
    
    setRecording({
      isRecording: false,
      duration: 0,
      waveformData: [],
      liveTranscription: '',
      finalTranscription: '',
      isListening: false,
      confidence: 0,
      language: 'en-US',
      interimResults: [],
    });
    
    audioChunks.current = [];
  }, []);

  const changeLanguage = useCallback((language: string) => {
    setRecording(prev => ({ ...prev, language }));
    if (recognition.current) {
      recognition.current.lang = language;
    }
  }, []);

  return {
    recording,
    startRecording,
    stopRecording,
    resetRecording,
    changeLanguage,
    isSupported: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
  };
};