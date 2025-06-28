import React, { useState, useEffect, useRef } from 'react';
import { FileText, Sparkles, Clock, Users, BookOpen, Briefcase, Lightbulb, ChevronRight } from 'lucide-react';
import { SmartTemplate, TemplateSection } from '../types';
import { AIService } from '../services/aiService';
import { gsap } from 'gsap';

interface SmartTemplatesProps {
  onSelectTemplate: (template: SmartTemplate) => void;
  onClose: () => void;
  currentContent?: string;
}

export const SmartTemplates: React.FC<SmartTemplatesProps> = ({ onSelectTemplate, onClose, currentContent }) => {
  const [templates, setTemplates] = useState<SmartTemplate[]>([]);
  const [suggestedTemplates, setSuggestedTemplates] = useState<SmartTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTemplates();
  }, [currentContent]);

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
    if (templatesRef.current && templates.length > 0) {
      gsap.fromTo(templatesRef.current.children,
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
  }, [templates, selectedCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // Load all templates
      const allTemplates: SmartTemplate[] = [
        {
          id: 'template-meeting',
          name: 'Meeting Notes',
          description: 'Structured template for meeting documentation with action items',
          category: 'meetings',
          structure: [
            { id: '1', title: 'Meeting Objective', placeholder: 'What is the main purpose?', type: 'text', required: true, aiAssisted: false },
            { id: '2', title: 'Attendees', placeholder: 'Who was present?', type: 'list', required: true, aiAssisted: false },
            { id: '3', title: 'Key Discussions', placeholder: 'Main topics covered', type: 'text', required: true, aiAssisted: true },
            { id: '4', title: 'Action Items', placeholder: 'What needs to be done?', type: 'list', required: true, aiAssisted: true },
            { id: '5', title: 'Next Steps', placeholder: 'Follow-up actions', type: 'text', required: false, aiAssisted: true }
          ],
          aiPrompts: ['Extract action items', 'Identify key decisions', 'Suggest follow-ups'],
          tags: ['meeting', 'structured', 'actionable'],
          usageCount: 45
        },
        {
          id: 'template-research',
          name: 'Research Notes',
          description: 'Comprehensive template for research documentation and analysis',
          category: 'research',
          structure: [
            { id: '1', title: 'Research Question', placeholder: 'What are you investigating?', type: 'text', required: true, aiAssisted: false },
            { id: '2', title: 'Sources', placeholder: 'Reference materials', type: 'list', required: true, aiAssisted: false },
            { id: '3', title: 'Key Findings', placeholder: 'Important discoveries', type: 'text', required: true, aiAssisted: true },
            { id: '4', title: 'Analysis', placeholder: 'Your interpretation', type: 'text', required: true, aiAssisted: true },
            { id: '5', title: 'Conclusions', placeholder: 'Summary and implications', type: 'text', required: false, aiAssisted: true }
          ],
          aiPrompts: ['Summarize findings', 'Identify patterns', 'Suggest further research'],
          tags: ['research', 'analysis', 'academic'],
          usageCount: 23
        },
        {
          id: 'template-project',
          name: 'Project Planning',
          description: 'Comprehensive project planning and tracking template',
          category: 'projects',
          structure: [
            { id: '1', title: 'Project Overview', placeholder: 'Brief description and goals', type: 'text', required: true, aiAssisted: false },
            { id: '2', title: 'Objectives', placeholder: 'Specific, measurable goals', type: 'list', required: true, aiAssisted: true },
            { id: '3', title: 'Timeline', placeholder: 'Key milestones and deadlines', type: 'table', required: true, aiAssisted: false },
            { id: '4', title: 'Resources', placeholder: 'Required resources and budget', type: 'list', required: true, aiAssisted: false },
            { id: '5', title: 'Risk Assessment', placeholder: 'Potential challenges and mitigation', type: 'text', required: false, aiAssisted: true }
          ],
          aiPrompts: ['Suggest objectives', 'Identify risks', 'Recommend resources'],
          tags: ['project', 'planning', 'management'],
          usageCount: 31
        },
        {
          id: 'template-brainstorm',
          name: 'Brainstorming Session',
          description: 'Creative ideation and concept development template',
          category: 'creative',
          structure: [
            { id: '1', title: 'Challenge/Problem', placeholder: 'What are we trying to solve?', type: 'text', required: true, aiAssisted: false },
            { id: '2', title: 'Ideas', placeholder: 'All ideas, no judgment', type: 'list', required: true, aiAssisted: false },
            { id: '3', title: 'Top Concepts', placeholder: 'Most promising ideas', type: 'list', required: true, aiAssisted: true },
            { id: '4', title: 'Next Actions', placeholder: 'How to develop these ideas', type: 'list', required: false, aiAssisted: true }
          ],
          aiPrompts: ['Expand on ideas', 'Suggest combinations', 'Identify next steps'],
          tags: ['creative', 'ideation', 'innovation'],
          usageCount: 18
        },
        {
          id: 'template-learning',
          name: 'Learning Notes',
          description: 'Structured template for educational content and skill development',
          category: 'education',
          structure: [
            { id: '1', title: 'Topic/Subject', placeholder: 'What are you learning?', type: 'text', required: true, aiAssisted: false },
            { id: '2', title: 'Key Concepts', placeholder: 'Main ideas and principles', type: 'list', required: true, aiAssisted: true },
            { id: '3', title: 'Examples', placeholder: 'Practical applications', type: 'text', required: false, aiAssisted: true },
            { id: '4', title: 'Questions', placeholder: 'Areas for further exploration', type: 'list', required: false, aiAssisted: true },
            { id: '5', title: 'Summary', placeholder: 'Key takeaways', type: 'text', required: false, aiAssisted: true }
          ],
          aiPrompts: ['Explain concepts', 'Provide examples', 'Generate questions'],
          tags: ['learning', 'education', 'knowledge'],
          usageCount: 27
        }
      ];

      setTemplates(allTemplates);

      // Get AI suggestions based on current content
      if (currentContent) {
        const suggested = await AIService.suggestTemplates(currentContent);
        setSuggestedTemplates(suggested);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
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

  const categories = [
    { id: 'all', name: 'All Templates', icon: FileText },
    { id: 'meetings', name: 'Meetings', icon: Users },
    { id: 'research', name: 'Research', icon: BookOpen },
    { id: 'projects', name: 'Projects', icon: Briefcase },
    { id: 'creative', name: 'Creative', icon: Lightbulb },
    { id: 'education', name: 'Learning', icon: BookOpen }
  ];

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'meetings': return Users;
      case 'research': return BookOpen;
      case 'projects': return Briefcase;
      case 'creative': return Lightbulb;
      case 'education': return BookOpen;
      default: return FileText;
    }
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div ref={containerRef} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-gray-800/50 dark:to-purple-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-3 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Templates</h2>
                <p className="text-gray-600 dark:text-gray-300">AI-powered templates to structure your thoughts</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              ✕
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mt-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white/20 dark:bg-gray-800/20 text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-800/30'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading smart templates...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Suggestions */}
              {suggestedTemplates.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span>AI Suggested for Your Content</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {suggestedTemplates.map(template => {
                      const IconComponent = getTemplateIcon(template.category);
                      return (
                        <div
                          key={template.id}
                          onClick={() => onSelectTemplate(template)}
                          className="bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-800/50 cursor-pointer hover:border-yellow-400/50 transition-all duration-300 group"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{template.name}</h4>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{template.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 capitalize">{template.category}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-yellow-500 transition-colors duration-200" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Templates */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {selectedCategory === 'all' ? 'All Templates' : categories.find(c => c.id === selectedCategory)?.name}
                </h3>
                <div ref={templatesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map(template => {
                    const IconComponent = getTemplateIcon(template.category);
                    return (
                      <div
                        key={template.id}
                        onClick={() => onSelectTemplate(template)}
                        className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:border-primary-400/50 cursor-pointer transition-all duration-300 group"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{template.name}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{template.description}</p>
                            
                            <div className="space-y-2 mb-4">
                              <div className="text-xs text-gray-500 font-medium">Structure:</div>
                              {template.structure.slice(0, 3).map(section => (
                                <div key={section.id} className="flex items-center space-x-2 text-xs">
                                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                                  <span className="text-gray-600 dark:text-gray-400">{section.title}</span>
                                  {section.aiAssisted && (
                                    <Sparkles className="w-3 h-3 text-yellow-500" />
                                  )}
                                </div>
                              ))}
                              {template.structure.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{template.structure.length - 3} more sections
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{template.usageCount} uses</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};