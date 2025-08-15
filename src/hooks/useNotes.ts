import { useState, useEffect } from 'react';
import { Note, NotesService } from '../services/notesService';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const approvedNotes = await NotesService.getApprovedNotes();
      setNotes(approvedNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const refreshNotes = () => {
    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
    
    // Listen for notes updates from other components
    const handleNotesUpdate = () => {
      fetchNotes();
    };
    
    window.addEventListener('notesUpdated', handleNotesUpdate);
    
    return () => {
      window.removeEventListener('notesUpdated', handleNotesUpdate);
    };
  }, []);

  return { notes, loading, error, refreshNotes };
}
