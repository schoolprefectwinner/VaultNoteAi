import React, { useRef, useEffect } from 'react';
import { Calendar, Hash, FileText, Mic, Clock, Eye } from 'lucide-react';
import { Note } from '../types';
import { gsap } from 'gsap';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  viewMode?: 'grid' | 'list';
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, viewMode = 'grid' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.set(cardRef.current, { 
        opacity: 0,
        y: 30,
        scale: 0.95
      });
      
      gsap.to(cardRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.2)"
      });
    }
  }, []);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: -8,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });

      // Animate content elements
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          y: -2,
          duration: 0.3,
          ease: "power2.out"
        });
      }

      if (tagsRef.current) {
        gsap.to(tagsRef.current.children, {
          scale: 1.05,
          duration: 0.2,
          stagger: 0.05,
          ease: "power2.out"
        });
      }
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });

      if (contentRef.current) {
        gsap.to(contentRef.current, {
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }

      if (tagsRef.current) {
        gsap.to(tagsRef.current.children, {
          scale: 1,
          duration: 0.2,
          stagger: 0.02,
          ease: "power2.out"
        });
      }
    }
  };

  const handleClick = () => {
    // Click animation
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: onClick
      });
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        ref={cardRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:border-primary-400/50 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1" ref={contentRef}>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {note.title}
              </h3>
              {note.audioUrl && (
                <Mic className="w-5 h-5 text-primary-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
              {note.summary || note.content}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
            
            <div ref={tagsRef} className="flex items-center space-x-1">
              {note.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-gray-400">+{note.tags.length - 3}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:border-primary-400/50 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate flex-1 pr-2">
            {note.title}
          </h3>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {note.audioUrl && (
              <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                <Mic className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
            )}
            {note.summary && (
              <div className="bg-accent-100 dark:bg-accent-900/30 p-2 rounded-lg">
                <Eye className="w-4 h-4 text-accent-600 dark:text-accent-400" />
              </div>
            )}
          </div>
        </div>

        <div ref={contentRef}>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
            {note.summary || note.content}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          
          <div ref={tagsRef} className="flex items-center space-x-1">
            {note.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-gray-400 font-medium">+{note.tags.length - 2}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};