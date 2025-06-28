import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Calendar, Tag, User, MapPin, TrendingUp, Brain, Zap } from 'lucide-react';
import { Note, SearchResult, SortMode, FilterMode } from '../types';
import { AIService } from '../services/aiService';
import { gsap } from 'gsap';

interface AdvancedSearchProps {
  notes: Note[];
  onResults: (results: SearchResult[]) => void;
  onClose: () => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ notes, onResults, onClose }) => {
  const [query, setQuery] = useState('');
  const [semanticSearch, setSemanticSearch] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchRef.current && overlayRef.current) {
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(searchRef.current, { scale: 0.9, opacity: 0, y: 50 });

      const tl = gsap.timeline();
      tl.to(overlayRef.current, { opacity: 1, duration: 0.3 })
        .to(searchRef.current, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }, "-=0.1");
    }
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    try {
      let results: SearchResult[];
      
      if (semanticSearch) {
        results = await AIService.semanticSearch(query, notes);
      } else {
        // Basic text search
        results = notes.filter(note => 
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase()) ||
          note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ).map(note => ({
          note,
          relevanceScore: 0.5,
          matchedFields: ['content'],
          highlightedContent: note.content.substring(0, 200) + '...'
        }));
      }

      // Apply filters
      if (selectedTags.length > 0) {
        results = results.filter(result => 
          selectedTags.some(tag => result.note.tags.includes(tag))
        );
      }

      if (dateRange.start) {
        const startDate = new Date(dateRange.start);
        results = results.filter(result => 
          new Date(result.note.createdAt) >= startDate
        );
      }

      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        results = results.filter(result => 
          new Date(result.note.createdAt) <= endDate
        );
      }

      // Apply sorting
      switch (sortMode) {
        case 'recent':
          results.sort((a, b) => new Date(b.note.updatedAt).getTime() - new Date(a.note.updatedAt).getTime());
          break;
        case 'alphabetical':
          results.sort((a, b) => a.note.title.localeCompare(b.note.title));
          break;
        case 'priority':
          results.sort((a, b) => {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.note.priority || 'low'] || 1) - (priorityOrder[a.note.priority || 'low'] || 1);
          });
          break;
        case 'relevance':
        default:
          results.sort((a, b) => b.relevanceScore - a.relevanceScore);
          break;
      }

      onResults(results);
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  const handleClose = () => {
    if (searchRef.current && overlayRef.current) {
      const tl = gsap.timeline({ onComplete: onClose });
      tl.to(searchRef.current, { scale: 0.9, opacity: 0, y: 50, duration: 0.3 })
        .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
    }
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div ref={searchRef} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-gray-800/50 dark:to-purple-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-3 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Search</h2>
                <p className="text-gray-600 dark:text-gray-300">AI-powered semantic search across your notes</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Search Input */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your notes with natural language..."
                className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Semantic Search Toggle */}
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={semanticSearch}
                  onChange={(e) => setSemanticSearch(e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Semantic Search</span>
              </label>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                <span>Understands context and meaning</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Date Range</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="p-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="p-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort & Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Sort & Filter</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="p-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="recent">Most Recent</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="priority">Priority</option>
                </select>
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as FilterMode)}
                  className="p-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Notes</option>
                  <option value="favorites">Favorites</option>
                  <option value="shared">Shared</option>
                  <option value="actionable">With Actions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>Filter by Tags</span>
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};