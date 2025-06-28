import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Filter, Mic, FileText, Tag, Grid, List, Baseline as Timeline, Brain, Sparkles, TrendingUp, Calendar, MapPin, Zap } from 'lucide-react';
import { Note, ViewMode, SearchResult } from '../types';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { AdvancedSearch } from './AdvancedSearch';
import { AIInsights } from './AIInsights';
import { SmartTemplates } from './SmartTemplates';
import { gsap } from 'gsap';

interface DashboardProps {
  notes: Note[];
  onCreateNote: () => void;
  onUpdateNote: (note: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Set initial states
    gsap.set([headerRef.current, searchRef.current, quickActionsRef.current], { 
      opacity: 0, 
      y: -30 
    });
    gsap.set(createButtonRef.current, { 
      opacity: 0, 
      scale: 0.8 
    });
    gsap.set(statsRef.current, { 
      opacity: 0, 
      x: -20 
    });

    // Animate header elements
    tl.to(headerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out"
    })
    .to(statsRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.5")
    .to(createButtonRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "-=0.4")
    .to(searchRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3")
    .to(quickActionsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.2");

    // Animate notes grid when notes change
    if (gridRef.current && notes.length > 0) {
      gsap.fromTo(gridRef.current.children,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.2)",
          delay: 0.5
        }
      );
    }
  }, []);

  useEffect(() => {
    // Animate notes when they change
    if (gridRef.current) {
      gsap.fromTo(gridRef.current.children,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out"
        }
      );
    }
  }, [notes, searchQuery, selectedTag, viewMode]);

  const displayNotes = showSearchResults 
    ? searchResults.map(result => result.note)
    : notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             note.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = !selectedTag || note.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
      });

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Calculate productivity stats
  const todayNotes = notes.filter(note => {
    const today = new Date();
    const noteDate = new Date(note.createdAt);
    return noteDate.toDateString() === today.toDateString();
  }).length;

  const totalWords = notes.reduce((sum, note) => sum + (note.wordCount || note.content.split(' ').length), 0);
  const actionableNotes = notes.filter(note => note.actionItems && note.actionItems.length > 0).length;

  const handleCreateNote = () => {
    // Animate button press
    if (createButtonRef.current) {
      gsap.to(createButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    onUpdateNote(noteData);
    setIsEditorOpen(false);
    
    // Show success animation
    gsap.to(headerRef.current, {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      duration: 0.3,
      yoyo: true,
      repeat: 1
    });
  };

  const handleDeleteNote = () => {
    if (selectedNote) {
      onDeleteNote(selectedNote.id);
      setIsEditorOpen(false);
      
      // Show delete animation
      gsap.to(headerRef.current, {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        duration: 0.3,
        yoyo: true,
        repeat: 1
      });
    }
  };

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
    setShowSearchResults(true);
    setIsAdvancedSearchOpen(false);
  };

  const handleTemplateSelect = (template: any) => {
    // Create a new note with template structure
    const templateNote = {
      title: `New ${template.name}`,
      content: template.structure.map((section: any) => 
        `## ${section.title}\n${section.placeholder}\n\n`
      ).join(''),
      tags: template.tags
    };
    
    setSelectedNote(templateNote as Note);
    setIsTemplatesOpen(false);
    setIsEditorOpen(true);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    
    // Animate transition
    if (gridRef.current) {
      gsap.fromTo(gridRef.current,
        { opacity: 0, scale: 0.95 },
        { 
          opacity: 1, 
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <div 
        ref={headerRef}
        className="p-6 border-b border-white/20 backdrop-blur-sm sticky top-16 z-40"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-6">
            {/* Title and Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div ref={statsRef}>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  My Notes
                </h2>
                <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <span>{notes.length} total notes</span>
                  <span>{todayNotes} created today</span>
                  <span>{totalWords.toLocaleString()} words</span>
                  <span>{actionableNotes} actionable</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  ref={createButtonRef}
                  onClick={handleCreateNote}
                  className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">New Note</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div 
              ref={quickActionsRef}
              className="flex flex-wrap gap-3"
            >
              <button
                onClick={() => setIsAdvancedSearchOpen(true)}
                className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200"
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">AI Search</span>
              </button>
              
              <button
                onClick={() => setIsInsightsOpen(true)}
                className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Insights</span>
              </button>
              
              <button
                onClick={() => setIsTemplatesOpen(true)}
                className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Templates</span>
              </button>

              <div className="flex items-center space-x-1 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl p-1 border border-white/30">
                {[
                  { mode: 'grid' as ViewMode, icon: Grid },
                  { mode: 'list' as ViewMode, icon: List },
                  { mode: 'timeline' as ViewMode, icon: Timeline }
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === mode 
                        ? 'bg-primary-500 text-white shadow-lg' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Filters */}
            <div 
              ref={searchRef}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(false);
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                />
                {showSearchResults && (
                  <button
                    onClick={() => setShowSearchResults(false)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {displayNotes.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative">
                <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-full blur-xl"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-3">
                {notes.length === 0 ? 'No notes yet' : 'No notes found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {notes.length === 0 
                  ? 'Create your first note with voice recording or text to get started'
                  : 'Try adjusting your search terms or filters to find what you\'re looking for'
                }
              </p>
              {notes.length === 0 && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleCreateNote}
                    className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white px-8 py-4 rounded-xl flex items-center space-x-3 mx-auto shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">Create First Note</span>
                  </button>
                  <button
                    onClick={() => setIsTemplatesOpen(true)}
                    className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl flex items-center space-x-3 mx-auto hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">Use Template</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div 
              ref={gridRef}
              className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : viewMode === 'list'
                    ? 'space-y-4'
                    : 'space-y-6' // timeline view
              }`}
            >
              {displayNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onClick={() => handleNoteClick(note)}
                  viewMode={viewMode === 'grid' ? 'grid' as const : 'list' as const}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isEditorOpen && (
        <NoteEditor
          note={selectedNote || undefined}
          onSave={handleSaveNote}
          onDelete={selectedNote ? handleDeleteNote : undefined}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {isAdvancedSearchOpen && (
        <AdvancedSearch
          notes={notes}
          onResults={handleSearchResults}
          onClose={() => setIsAdvancedSearchOpen(false)}
        />
      )}

      {isInsightsOpen && (
        <AIInsights
          notes={notes}
          onClose={() => setIsInsightsOpen(false)}
        />
      )}

      {isTemplatesOpen && (
        <SmartTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setIsTemplatesOpen(false)}
          currentContent={searchQuery}
        />
      )}
    </div>
  );
};