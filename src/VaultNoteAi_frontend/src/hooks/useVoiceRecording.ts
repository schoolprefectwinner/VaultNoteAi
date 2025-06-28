import { useState, useRef, useCallback } from 'react';
import { VoiceRecording } from '../types';

export const useVoiceRecording = () => {
  const [recording, setRecording] = useState<VoiceRecording>({
    isRecording: false,
    duration: 0,
    waveformData: [],
  });
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number>();

  const startRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      stream.current = mediaStream;
      
      // Setup audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(mediaStream);
      analyser.current = audioContext.createAnalyser();
      analyser.current.fftSize = 256;
      source.connect(analyser.current);

      // Setup media recorder
      mediaRecorder.current = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setRecording(prev => ({ ...prev, audioBlob }));
      };

      mediaRecorder.current.start(100); // Collect data every 100ms
      
      setRecording(prev => ({ ...prev, isRecording: true }));
      updateWaveform();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && recording.isRecording) {
      mediaRecorder.current.stop();
      
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
      }
      
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      setRecording(prev => ({ 
        ...prev, 
        isRecording: false,
        waveformData: [],
      }));
    }
  }, [recording.isRecording]);

  const updateWaveform = useCallback(() => {
    if (!analyser.current || !recording.isRecording) return;

    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.current.getByteFrequencyData(dataArray);

    // Convert to normalized values for waveform
    const waveformData = Array.from(dataArray).slice(0, 32).map(value => value / 255);
    
    setRecording(prev => ({ 
      ...prev, 
      waveformData,
      duration: prev.duration + 0.1,
    }));

    animationFrame.current = requestAnimationFrame(updateWaveform);
  }, [recording.isRecording]);

  const resetRecording = useCallback(() => {
    setRecording({
      isRecording: false,
      duration: 0,
      waveformData: [],
    });
    audioChunks.current = [];
  }, []);

  return {
    recording,
    startRecording,
    stopRecording,
    resetRecording,
  };
};