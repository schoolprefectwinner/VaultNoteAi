import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { AuthProvider } from './components/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { Note } from './types';
import { EncryptionService } from './utils/encryption';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Load notes from localStorage (in production, this would be from ICP)
    if (isAuthenticated) {
      const savedNotes = localStorage.getItem('vaultnoteai');
      if (savedNotes) {
        try {
          setNotes(JSON.parse(savedNotes));
        } catch (error) {
          console.error('Failed to load notes:', error);
        }
      }
    }
  }, [isAuthenticated]);

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleCreateNote = () => {
    // This will be handled by the Dashboard component
  };

  const handleUpdateNote = (noteData: Partial<Note>) => {
    const updatedNotes = noteData.id && notes.find(n => n.id === noteData.id)
      ? notes.map(note => note.id === noteData.id ? { ...note, ...noteData } : note)
      : [...notes, { ...noteData, hash: EncryptionService.hashContent(noteData.content || '') } as Note];
    
    setNotes(updatedNotes);
    
    // Save to localStorage (in production, this would be encrypted and stored on ICP)
    localStorage.setItem('vaultnoteai', JSON.stringify(updatedNotes));
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem('vaultnoteai', JSON.stringify(updatedNotes));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen">
      <Header theme={theme} onThemeToggle={handleThemeToggle} />
      <Dashboard
        notes={notes}
        onCreateNote={handleCreateNote}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;