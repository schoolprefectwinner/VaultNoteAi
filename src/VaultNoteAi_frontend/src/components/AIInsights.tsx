import React, { useState, useEffect, useRef } from 'react';
import { Brain, TrendingUp, Lightbulb, Target, Calendar, Users, Zap, ChevronRight, Star } from 'lucide-react';
import { Note, AIInsight, AnalyticsData, GoalProgress } from '../types';
import { AIService } from '../services/aiService';
import { gsap } from 'gsap';

interface AIInsightsProps {
  notes: Note[];
  onClose: () => void;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ notes, onClose }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'analytics' | 'goals'>('insights');

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInsights();
  }, [notes]);

  useEffect(() => {
    if (containerRef.current && overlayRef.current) {
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(containerRef.current, { scale: 0.9, opacity: 0, y: 50 });

      const tl = gsap.timeline();
      tl.to(overlayRef.current, { opacity: 1, duration: 0.3 })
        .to(containerRef.current, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }, "-=0.1");
    }
  }, []);

  useEffect(() => {
    if (cardsRef.current && insights.length > 0) {
      gsap.fromTo(cardsRef.current.children,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.2)",
          delay: 0.2
        }
      );
    }
  }, [insights, activeTab]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [insightsData, analyticsData] = await Promise.all([
        AIService.generateInsights(notes),
        AIService.generateAnalytics(notes)
      ]);
      
      setInsights(insightsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (containerRef.current && overlayRef.current) {
      const tl = gsap.timeline({ onComplete: onClose });
      tl.to(containerRef.current, { scale: 0.9, opacity: 0, y: 50, duration: 0.3 })
        .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return TrendingUp;
      case 'suggestion': return Lightbulb;
      case 'connection': return Users;
      case 'trend': return Calendar;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'from-blue-500 to-indigo-500';
      case 'suggestion': return 'from-yellow-500 to-orange-500';
      case 'connection': return 'from-green-500 to-emerald-500';
      case 'trend': return 'from-purple-500 to-pink-500';
      default: return 'from-primary-500 to-accent-500';
    }
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div ref={containerRef} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-gray-800/50 dark:to-purple-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-3 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights</h2>
                <p className="text-gray-600 dark:text-gray-300">Discover patterns and optimize your productivity</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-6 bg-white/20 dark:bg-gray-800/20 rounded-xl p-1">
            {[
              { id: 'insights', label: 'Smart Insights', icon: Brain },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'goals', label: 'Goals', icon: Target }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Analyzing your notes with AI...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Insights Tab */}
              {activeTab === 'insights' && (
                <div ref={cardsRef} className="space-y-6">
                  {insights.map(insight => {
                    const IconComponent = getInsightIcon(insight.type);
                    const colorClass = getInsightColor(insight.type);
                    
                    return (
                      <div
                        key={insight.id}
                        className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:border-primary-400/50 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`bg-gradient-to-br ${colorClass} p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{insight.title}</h3>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Star className="w-3 h-3 fill-current text-yellow-500" />
                                  <span>{Math.round(insight.confidence * 100)}%</span>
                                </div>
                                {insight.actionable && (
                                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                                    Actionable
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                              {insight.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 capitalize">
                                {insight.type} • {insight.relatedNotes.length} related notes
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && analytics && (
                <div className="space-y-6">
                  {/* Productivity Score */}
                  <div className="bg-gradient-to-br from-primary-50/50 to-accent-50/50 dark:from-gray-800/50 dark:to-purple-900/50 rounded-2xl p-6 border border-white/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Productivity Score</h3>
                      <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {analytics.productivityScore}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${analytics.productivityScore}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Based on note frequency, quality, and engagement patterns
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Words', value: analytics.totalWords.toLocaleString(), icon: '📝' },
                      { label: 'Avg Session', value: `${analytics.averageSessionTime}m`, icon: '⏱️' },
                      { label: 'Streak Days', value: analytics.streakDays, icon: '🔥' },
                      { label: 'Collaboration', value: `${Math.round(analytics.collaborationIndex * 100)}%`, icon: '🤝' }
                    ].map((stat, index) => (
                      <div key={index} className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top Topics */}
                  <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {analytics.topTopics.map((topic: string, index: number) => (
                        <span
                          key={topic}
                          className="bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Goals Tab */}
              {activeTab === 'goals' && analytics && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Progress</h3>
                    <p className="text-gray-600 dark:text-gray-300">Track your productivity goals and achievements</p>
                  </div>

                  {analytics.goalProgress.map((goal: any, index: number) => (
                    <div key={index} className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{goal.goal}</h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {goal.current} / {goal.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            goal.percentage >= 100 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : goal.percentage >= 75
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          }`}
                          style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {goal.percentage}% complete
                        </span>
                        {goal.percentage >= 100 && (
                          <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                            ✅ Goal achieved!
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};