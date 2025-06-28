import React, { useState, useRef, useEffect } from 'react';
import { Save, Trash2, Download, Volume2, Loader, X, Sparkles, Brain, Mic } from 'lucide-react';
import { Note } from '../types';
import { VoiceRecorder } from './VoiceRecorder';
import { AIService } from '../services/aiService';
import { gsap } from 'gsap';

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Partial<Note>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [transcription, setTranscription] = useState(note?.transcription || '');
  const [summary, setSummary] = useState(note?.summary || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (editorRef.current && overlayRef.current) {
      // Set initial states
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(editorRef.current, { 
        scale: 0.9, 
        opacity: 0,
        y: 50
      });

      // Animation timeline
      const tl = gsap.timeline();
      
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(editorRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "back.out(1.2)"
      }, "-=0.1");

      // Animate sections
      if (headerRef.current && contentRef.current && sidebarRef.current) {
        gsap.fromTo([headerRef.current, contentRef.current, sidebarRef.current],
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.3
          }
        );
      }
    }
  }, []);

  const handleClose = () => {
    if (editorRef.current && overlayRef.current) {
      const tl = gsap.timeline({
        onComplete: onClose
      });
      
      tl.to(editorRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 50,
        duration: 0.3,
        ease: "power2.in"
      })
      .to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
      }, "-=0.1");
    }
  };

  const handleAudioReady = async (blob: Blob) => {
    setAudioBlob(blob);
    setIsProcessing(true);

    // Processing animation
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        duration: 0.5,
        yoyo: true,
        repeat: -1
      });
    }

    try {
      // Transcribe audio
      const transcriptionText = await AIService.transcribeAudio(blob);
      setTranscription(transcriptionText);

      // Generate AI summary
      const aiResponse = await AIService.summarizeText(transcriptionText);
      setSummary(aiResponse);

      // Generate tags
      const generatedTags = await AIService.generateTags(transcriptionText);
      setTags(prev => [...new Set([...prev, ...generatedTags])]);

      // Update content with transcription
      setContent(prev => prev + (prev ? '\n\n' : '') + transcriptionText);
      
      // Success animation
      if (sidebarRef.current) {
        gsap.to(sidebarRef.current, {
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          duration: 0.3,
          yoyo: true,
          repeat: 1
        });
      }
      
    } catch (error) {
      console.error('Failed to process audio:', error);
      
      // Error animation
      if (sidebarRef.current) {
        gsap.to(sidebarRef.current, {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          duration: 0.3,
          yoyo: true,
          repeat: 1
        });
      }
    } finally {
      setIsProcessing(false);
      
      // Stop processing animation
      if (sidebarRef.current) {
        gsap.killTweensOf(sidebarRef.current);
        gsap.to(sidebarRef.current, {
          backgroundColor: 'transparent',
          duration: 0.3
        });
      }
    }
  };

  const handleSave = () => {
    // Save button animation
    if (saveButtonRef.current) {
      gsap.to(saveButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }

    const noteData: Partial<Note> = {
      id: note?.id || crypto.randomUUID(),
      title: title || 'Untitled Note',
      content,
      transcription,
      summary,
      tags,
      updatedAt: new Date(),
      createdAt: note?.createdAt || new Date(),
      encrypted: true,
      version: (note?.version || 0) + 1,
    };

    onSave(noteData);
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      
      // Animate new tag
      setTimeout(() => {
        const tagElements = document.querySelectorAll('.tag-item');
        const lastTag = tagElements[tagElements.length - 1];
        if (lastTag) {
          gsap.fromTo(lastTag,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
          );
        }
      }, 50);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div 
        ref={editorRef}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div 
          ref={headerRef}
          className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-gray-800/50 dark:to-purple-900/50"
        >
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 flex-1 mr-4"
            />
            <div className="flex items-center space-x-3">
              <button
                ref={saveButtonRef}
                onClick={handleSave}
                className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Save className="w-5 h-5" />
                <span className="font-semibold">Save</span>
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-3 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Column - Content */}
          <div 
            ref={contentRef}
            className="flex-1 p-6 space-y-6 overflow-y-auto"
          >
            {/* Voice Recorder */}
            <div className="bg-gradient-to-br from-primary-50/50 to-accent-50/50 dark:from-gray-800/50 dark:to-purple-900/50 rounded-2xl p-6 border border-white/30">
              <div className="flex items-center space-x-2 mb-4">
                <Mic className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Voice Recording</h3>
              </div>
              <VoiceRecorder
                onTranscription={setTranscription}
                onAudioReady={handleAudioReady}
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                <span>Content</span>
                <div className="h-px bg-gradient-to-r from-primary-400 to-accent-400 flex-1 ml-3"></div>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing your note or use voice recording..."
                className="w-full h-80 p-6 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                <span>Tags</span>
                <div className="h-px bg-gradient-to-r from-primary-400 to-accent-400 flex-1 ml-3"></div>
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="tag-item bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm flex items-center space-x-2 border border-primary-200/50 dark:border-primary-800/50"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-primary-500 hover:text-primary-700 transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add tag and press Enter"
                className="w-full p-4 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTag((e.target as HTMLInputElement).value.trim());
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
          </div>

          {/* Right Column - AI Features */}
          <div 
            ref={sidebarRef}
            className="w-96 p-6 space-y-6 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 border-l border-gray-200/50 dark:border-gray-700/50"
          >
            {/* Processing Indicator */}
            {isProcessing && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <Loader className="w-6 h-6 animate-spin text-yellow-600" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Processing Audio</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">AI is analyzing your recording...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Transcription */}
            {transcription && (
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center space-x-2 mb-4">
                  <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Transcription</h4>
                </div>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  {transcription}
                </p>
              </div>
            )}

            {/* AI Summary */}
            {summary && (
              <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200">AI Summary</h4>
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-purple-800 dark:text-purple-200 text-sm leading-relaxed">
                  {summary}
                </p>
              </div>
            )}

            {/* Audio Playback */}
            {audioBlob && (
              <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center space-x-2 mb-4">
                  <Mic className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-green-800 dark:text-green-200">Recording</h4>
                </div>
                <audio
                  controls
                  src={URL.createObjectURL(audioBlob)}
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};