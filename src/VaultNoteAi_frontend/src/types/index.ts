export interface Note {
  id: string;
  title: string;
  content: string;
  transcription?: string;
  summary?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  encrypted: boolean;
  audioUrl?: string;
  version: number;
  hash: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  linkedNotes?: string[];
  mentions?: string[];
  actionItems?: ActionItem[];
  location?: GeolocationCoordinates;
  weather?: WeatherData;
  readingTime?: number;
  wordCount?: number;
  language?: string;
  collaborators?: string[];
  reminders?: Reminder[];
  attachments?: Attachment[];
  mindMap?: MindMapNode;
  aiInsights?: AIInsight[];
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  text: string;
  triggerDate: Date;
  type: 'time' | 'location' | 'context';
  isActive: boolean;
  recurring?: 'daily' | 'weekly' | 'monthly';
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'link';
  url: string;
  size?: number;
  thumbnail?: string;
}

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  children: MindMapNode[];
  color: string;
  connections: string[];
}

export interface AIInsight {
  id: string;
  type: 'pattern' | 'suggestion' | 'connection' | 'trend' | 'anomaly';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  relatedNotes: string[];
  createdAt: Date;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  location: string;
}

export interface User {
  id: string;
  principal: string;
  preferences: {
    theme: 'light' | 'dark';
    autoSave: boolean;
    voiceEnabled: boolean;
    aiSuggestions: boolean;
    smartNotifications: boolean;
    contextualReminders: boolean;
    collaborationMode: boolean;
    analyticsEnabled: boolean;
    language: string;
    timezone: string;
  };
  createdAt: Date;
  subscription: 'free' | 'pro' | 'enterprise';
  usageStats: UsageStats;
}

export interface UsageStats {
  totalNotes: number;
  totalWords: number;
  totalRecordingTime: number;
  averageSessionTime: number;
  mostActiveHours: number[];
  productivityScore: number;
  streakDays: number;
}

export interface VoiceRecording {
  isRecording: boolean;
  audioBlob?: Blob;
  duration: number;
  waveformData: number[];
  transcriptionProgress?: number;
  noiseLevel?: number;
  speechDetected?: boolean;
}

export interface AIResponse {
  transcription: string;
  summary: string;
  keyPoints: string[];
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  actionItems: ActionItem[];
  mentions: string[];
  suggestedTags: string[];
  relatedNotes: string[];
  language: string;
  topics: string[];
}

export interface SearchResult {
  note: Note;
  relevanceScore: number;
  matchedFields: string[];
  highlightedContent: string;
  semanticSimilarity?: number;
}

export interface AnalyticsData {
  productivityTrends: ProductivityTrend[];
  topicDistribution: TopicData[];
  writingPatterns: WritingPattern[];
  collaborationStats: CollaborationStats;
  goalProgress: GoalProgress[];
}

export interface ProductivityTrend {
  date: Date;
  notesCreated: number;
  wordsWritten: number;
  recordingTime: number;
  focusScore: number;
}

export interface TopicData {
  topic: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface WritingPattern {
  timeOfDay: number;
  averageWords: number;
  sentiment: number;
  creativity: number;
}

export interface CollaborationStats {
  sharedNotes: number;
  collaborators: number;
  commentsReceived: number;
  feedbackGiven: number;
}

export interface GoalProgress {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  category: 'writing' | 'learning' | 'productivity';
}

export interface EncryptionKey {
  key: CryptoKey;
  iv: Uint8Array;
}

export interface SmartTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: TemplateSection[];
  aiPrompts: string[];
  tags: string[];
  usageCount: number;
}

export interface TemplateSection {
  id: string;
  title: string;
  placeholder: string;
  type: 'text' | 'list' | 'table' | 'voice' | 'ai-generated';
  required: boolean;
  aiAssisted: boolean;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  clusters: KnowledgeCluster[];
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'note' | 'concept' | 'person' | 'place' | 'event';
  importance: number;
  connections: number;
  lastAccessed: Date;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  weight: number;
  type: 'reference' | 'similarity' | 'temporal' | 'causal';
}

export interface KnowledgeCluster {
  id: string;
  name: string;
  nodes: string[];
  coherence: number;
  topic: string;
}

export type ViewMode = 'grid' | 'list' | 'timeline' | 'mindmap' | 'kanban';
export type SortMode = 'recent' | 'alphabetical' | 'priority' | 'relevance' | 'sentiment';
export type FilterMode = 'all' | 'favorites' | 'shared' | 'archived' | 'actionable';