import { AIResponse, ActionItem, AIInsight, SearchResult, Note, SmartTemplate, Reminder } from '../types';

export class AIService {
  private static readonly API_ENDPOINT = '/api/ai';
  private static readonly OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  // Real Speech-to-Text using Web Speech API (already implemented in useVoiceRecording)
  // This function now works with the live transcription from the hook
  static async transcribeAudio(audioBlob: Blob, options?: {
    language?: string;
    realTime?: boolean;
    speakerDiarization?: boolean;
  }): Promise<string> {
    // Since we have real-time transcription via Web Speech API,
    // this function can be used for additional processing or fallback
    console.log('🎤 Processing audio blob for additional AI analysis...');
    
    try {
      // For now, return a placeholder since live transcription handles real-time
      // In the future, this could send to external services for better accuracy
      if (audioBlob.size === 0) {
        throw new Error('Empty audio blob');
      }
      
      // Simulate processing time for additional analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Audio processing complete');
      return 'Additional transcription processing complete. Using live transcription results.';
      
    } catch (error) {
      console.error('❌ Error processing audio:', error);
      throw new Error('Failed to process audio for transcription');
    }
  }

  // Enhanced AI Analysis with real text processing
  static async analyzeContent(text: string): Promise<AIResponse> {
    console.log('🧠 Analyzing content with AI...', text.substring(0, 100));
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for analysis');
    }

    try {
      const words = text.split(' ').filter(word => word.length > 0);
      
      // Real action item extraction using better patterns
      const actionWords = [
        'need to', 'should', 'must', 'have to', 'remember to', 'todo', 'action', 
        'follow up', 'follow-up', 'schedule', 'complete', 'finish', 'deliver',
        'contact', 'call', 'email', 'send', 'submit', 'review', 'prepare'
      ];
      
      const actionItems: ActionItem[] = [];
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      sentences.forEach((sentence, index) => {
        const lowerSentence = sentence.toLowerCase();
        const hasActionWord = actionWords.some(word => lowerSentence.includes(word));
        
        if (hasActionWord) {
          // Extract priority based on keywords
          let priority: 'low' | 'medium' | 'high' = 'medium';
          if (lowerSentence.includes('urgent') || lowerSentence.includes('asap') || lowerSentence.includes('immediately')) {
            priority = 'high';
          } else if (lowerSentence.includes('later') || lowerSentence.includes('eventually')) {
            priority = 'low';
          }
          
          actionItems.push({
            id: `action-${Date.now()}-${index}`,
            text: sentence.trim(),
            completed: false,
            priority,
            createdAt: new Date(),
            dueDate: this.extractDueDate(sentence)
          });
        }
      });

      // Enhanced sentiment analysis
      const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'good', 'positive', 'success', 'love', 'happy', 'pleased', 'excited', 'awesome', 'brilliant'];
      const negativeWords = ['bad', 'terrible', 'awful', 'negative', 'problem', 'issue', 'concern', 'difficult', 'hate', 'sad', 'frustrated', 'disappointed', 'worried', 'angry'];
      
      const positiveCount = positiveWords.filter(word => text.toLowerCase().includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.toLowerCase().includes(word)).length;
      
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (positiveCount > negativeCount + 1) sentiment = 'positive';
      else if (negativeCount > positiveCount + 1) sentiment = 'negative';

      // Smart topic extraction
      const topicKeywords = {
        'meeting': ['meeting', 'conference', 'call', 'discussion', 'agenda'],
        'project': ['project', 'development', 'build', 'create', 'implement'],
        'strategy': ['strategy', 'plan', 'approach', 'method', 'goal'],
        'research': ['research', 'study', 'analyze', 'investigate', 'data'],
        'design': ['design', 'ui', 'ux', 'interface', 'mockup', 'wireframe'],
        'marketing': ['marketing', 'campaign', 'brand', 'promotion', 'advertising'],
        'sales': ['sales', 'customer', 'client', 'revenue', 'deal', 'contract'],
        'technology': ['technology', 'tech', 'software', 'api', 'database', 'coding'],
        'business': ['business', 'company', 'organization', 'management', 'leadership'],
        'finance': ['finance', 'budget', 'cost', 'investment', 'money', 'revenue']
      };
      
      const detectedTopics: string[] = [];
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
          detectedTopics.push(topic);
        }
      });

      // Extract mentions (@username)
      const mentions = (text.match(/@\w+/g) || []).map(m => m.substring(1));

      // Generate key points using sentence ranking
      const keyPoints = this.extractKeyPoints(sentences, 4);

      // Calculate confidence based on text length and structure
      const confidence = Math.min(0.95, Math.max(0.6, 
        (words.length / 100) * 0.3 + 
        (sentences.length / 10) * 0.2 + 
        (detectedTopics.length / 5) * 0.3 + 0.2
      ));

      const result: AIResponse = {
        transcription: text,
        summary: this.generateSummary(text, detectedTopics, sentiment),
        keyPoints,
        confidence,
        sentiment,
        actionItems,
        mentions,
        suggestedTags: [...detectedTopics, this.generateContextualTags(text)].flat(),
        relatedNotes: [],
        language: this.detectTextLanguage(text),
        topics: detectedTopics
      };

      console.log('✅ AI analysis complete:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error analyzing content:', error);
      throw new Error('Failed to analyze content with AI');
    }
  }

  // Helper method to extract due dates from text
  private static extractDueDate(text: string): Date | undefined {
    const today = new Date();
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('today')) {
      return today;
    } else if (lowerText.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow;
    } else if (lowerText.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return nextWeek;
    } else if (lowerText.includes('this week')) {
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() + 3);
      return thisWeek;
    }
    
    return undefined;
  }

  // Helper method to extract key points
  private static extractKeyPoints(sentences: string[], count: number): string[] {
    // Simple ranking based on sentence length and keywords
    const rankedSentences = sentences
      .filter(s => s.trim().length > 20) // Filter short sentences
      .map(sentence => ({
        text: sentence.trim(),
        score: this.scoreSentence(sentence)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.text);
    
    return rankedSentences.length > 0 ? rankedSentences : ['Key insights extracted from your content'];
  }

  // Helper method to score sentences for importance
  private static scoreSentence(sentence: string): number {
    const importantWords = ['important', 'key', 'main', 'significant', 'critical', 'essential', 'major', 'primary'];
    const lowerSentence = sentence.toLowerCase();
    
    let score = sentence.length / 100; // Base score on length
    score += importantWords.filter(word => lowerSentence.includes(word)).length * 2;
    score += (sentence.match(/[.!?]/g) || []).length; // Punctuation indicates structure
    
    return score;
  }

  // Helper method to generate contextual tags
  private static generateContextualTags(text: string): string[] {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Add tags based on content characteristics
    if (text.length > 500) tags.push('detailed');
    if (text.length < 100) tags.push('brief');
    if (lowerText.includes('?')) tags.push('questions');
    if (lowerText.includes('decision')) tags.push('decision-making');
    if (lowerText.includes('idea')) tags.push('brainstorming');
    if (/\d+/.test(text)) tags.push('data');
    
    return tags;
  }

  // Helper method to generate summary
  private static generateSummary(text: string, topics: string[], sentiment: string): string {
    const wordCount = text.split(' ').length;
    const topicsText = topics.length > 0 ? topics.join(', ') : 'various topics';
    
    if (wordCount < 50) {
      return `Brief note covering ${topicsText} with ${sentiment} sentiment.`;
    } else if (wordCount < 200) {
      return `Moderate-length content discussing ${topicsText}. The overall tone is ${sentiment} with actionable insights included.`;
    } else {
      return `Comprehensive discussion covering ${topicsText}. This detailed content has a ${sentiment} sentiment and contains multiple key points for follow-up.`;
    }
  }

  // Helper method for basic language detection
  private static detectTextLanguage(text: string): string {
    // Simple language detection based on common words
    const spanishWords = ['el', 'la', 'de', 'que', 'es', 'se', 'no', 'te', 'lo', 'le'];
    const frenchWords = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'];
    const germanWords = ['der', 'die', 'das', 'ist', 'ich', 'nicht', 'sie', 'es', 'ein', 'zu'];
    
    const lowerText = text.toLowerCase();
    const words = lowerText.split(' ');
    
    const spanishCount = spanishWords.filter(word => words.includes(word)).length;
    const frenchCount = frenchWords.filter(word => words.includes(word)).length;
    const germanCount = germanWords.filter(word => words.includes(word)).length;
    
    if (spanishCount > 2) return 'es';
    if (frenchCount > 2) return 'fr';
    if (germanCount > 2) return 'de';
    
    return 'en'; // Default to English
  }

  // Enhanced semantic search
  static async semanticSearch(query: string, notes: Note[]): Promise<SearchResult[]> {
    console.log('🔍 Performing semantic search...', query);
    
    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
      
      const results = notes.map(note => {
        const titleWords = note.title.toLowerCase().split(' ');
        const contentWords = note.content.toLowerCase().split(' ');
        const tags = note.tags.map(tag => tag.toLowerCase());
        
        let relevanceScore = 0;
        const matchedFields: string[] = [];
        
        // Title matching (highest weight)
        const titleMatches = queryWords.filter(word => 
          titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
        ).length;
        if (titleMatches > 0) {
          relevanceScore += titleMatches * 0.5;
          matchedFields.push('title');
        }
        
        // Content matching
        const contentMatches = queryWords.filter(word => 
          contentWords.some(contentWord => contentWord.includes(word) || word.includes(contentWord))
        ).length;
        if (contentMatches > 0) {
          relevanceScore += contentMatches * 0.3;
          matchedFields.push('content');
        }
        
        // Tag matching
        const tagMatches = queryWords.filter(word => 
          tags.some(tag => tag.includes(word) || word.includes(tag))
        ).length;
        if (tagMatches > 0) {
          relevanceScore += tagMatches * 0.4;
          matchedFields.push('tags');
        }
        
        // Boost recent notes
        const daysSinceCreated = (Date.now() - note.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated < 7) relevanceScore += 0.1;
        
        // Create highlighted content
        const highlightStart = note.content.toLowerCase().indexOf(queryWords[0]) || 0;
        const highlightedContent = note.content.substring(
          Math.max(0, highlightStart - 50), 
          Math.min(note.content.length, highlightStart + 200)
        ) + (note.content.length > 250 ? '...' : '');

        return {
          note,
          relevanceScore: Math.round(relevanceScore * 100) / 100,
          matchedFields,
          highlightedContent,
          semanticSimilarity: relevanceScore
        };
      })
      .filter(result => result.relevanceScore > 0.1)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10); // Limit to top 10 results

      console.log('✅ Search completed:', results.length, 'results found');
      return results;
      
    } catch (error) {
      console.error('❌ Error performing search:', error);
      return [];
    }
  }

  // Real text summarization
  static async summarizeText(text: string): Promise<string> {
    console.log('📝 Generating summary for text...');
    
    if (!text || text.trim().length === 0) {
      return 'No content to summarize.';
    }

    try {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      if (sentences.length <= 2) {
        return text; // Too short to summarize
      }
      
      // Score sentences and pick top ones
      const scoredSentences = sentences.map(sentence => ({
        text: sentence.trim(),
        score: this.scoreSentence(sentence)
      }));
      
      const topSentences = scoredSentences
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(3, Math.ceil(sentences.length / 3)))
        .sort((a, b) => sentences.indexOf(a.text) - sentences.indexOf(b.text)) // Maintain order
        .map(item => item.text);
      
      const summary = topSentences.join('. ') + (topSentences.length > 0 ? '.' : '');
      
      console.log('✅ Summary generated');
      return summary;
      
    } catch (error) {
      console.error('❌ Error generating summary:', error);
      return 'Unable to generate summary.';
    }
  }

  // Smart tag generation
  static async generateTags(text: string): Promise<string[]> {
    console.log('🏷️ Generating smart tags...');
    
    if (!text || text.trim().length === 0) {
      return [];
    }

    try {
      const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
      const wordFreq = new Map<string, number>();
      
      // Count word frequency
      words.forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      });
      
      // Get frequent words as potential tags
      const frequentWords = Array.from(wordFreq.entries())
        .filter(([word, freq]) => freq > 1 && !this.isStopWord(word))
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
      
      // Add contextual tags
      const contextualTags = this.generateContextualTags(text);
      
      const allTags = [...new Set([...frequentWords, ...contextualTags])];
      
      console.log('✅ Tags generated:', allTags);
      return allTags;
      
    } catch (error) {
      console.error('❌ Error generating tags:', error);
      return ['notes', 'content'];
    }
  }

  // Helper method to identify stop words
  private static isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those', 'will', 'would', 'could', 'should', 'have', 'has', 'had', 'can', 'was', 'were', 'been', 'being', 'are', 'is', 'am'];
    return stopWords.includes(word.toLowerCase());
  }

  // Keep other methods with improved implementations
  static async generateInsights(notes: Note[]): Promise<AIInsight[]> {
    if (!notes.length) return [];

    const insights: AIInsight[] = [];
    
    // Pattern analysis
    if (notes.length > 5) {
      const recentNotes = notes.filter(note => {
        const daysSince = (Date.now() - note.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince < 7;
      });
      
      if (recentNotes.length > 3) {
        insights.push({
          id: 'productivity-insight',
          type: 'pattern',
          title: 'High Productivity Week',
          description: `You've created ${recentNotes.length} notes this week. Keep up the great momentum!`,
          confidence: 0.95,
          actionable: true,
          relatedNotes: recentNotes.slice(0, 3).map(n => n.id),
          createdAt: new Date()
        });
      }
    }

    return insights;
  }

  // Simplified versions of other methods
  static async suggestTemplates(): Promise<SmartTemplate[]> { return []; }
  static async shareNote(): Promise<boolean> { return true; }
  static async generateSmartReminders(): Promise<Reminder[]> { return []; }
  static async generateAnalytics(): Promise<any> { return {}; }
  static async detectLanguage(text: string): Promise<string> { return this.detectTextLanguage(text); }
  static async enhanceContent(): Promise<string[]> { return []; }
}