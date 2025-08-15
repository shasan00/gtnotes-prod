export interface Note {
  id: string;
  title: string;
  course: string;
  classCode?: string; // Added to match the API response
  professor: string;
  semester: string;
  description?: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileKey: string;     // Added to match the API response
  fileUrl?: string;     // Added for the generated URL
  status: 'pending' | 'approved' | 'rejected';
  uploadedBy: string;
  approvedBy?: string | null;
  type?: string;        // Added to match the UI
  createdAt: string;
  updatedAt: string;
}

export interface NoteResponse {
  note: Note;
}

export interface NotesResponse {
  notes: Note[];
}

// Get API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class NotesService {
  static async getNotes(): Promise<Note[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data: NotesResponse = await response.json();
      return data.notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  }

  static async getApprovedNotes(): Promise<Note[]> {
    try {
      const notes = await this.getNotes();
      return notes.filter(note => note.status === 'approved');
    } catch (error) {
      console.error('Error fetching approved notes:', error);
      return [];
    }
  }

  static async getNotesByUser(): Promise<Note[]> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/notes/my-notes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user notes');
      }

      const data: NotesResponse = await response.json();
      return data.notes;
    } catch (error) {
      console.error('Error fetching user notes:', error);
      return [];
    }
  }

  static async getNoteById(id: string): Promise<NoteResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch note');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching note:', error);
      return null;
    }
  }

  static async getPendingNotes(): Promise<Note[]> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/api/notes/admin/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`, // api
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending notes');
      }

      const data: NotesResponse = await response.json();
      return data.notes;
    } catch (error) {
      console.error('Error fetching pending notes:', error);
      return [];
    }
  }

  static async approveNote(noteId: string): Promise<Note | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/api/notes/admin/${noteId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to approve note');
      }

      const data: { note: Note } = await response.json();
      return data.note;
    } catch (error) {
      console.error('Error approving note:', error);
      return null;
    }
  }

  static async rejectNote(noteId: string): Promise<Note | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/api/notes/admin/${noteId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to reject note');
      }

      const data: { note: Note } = await response.json();
      return data.note;
    } catch (error) {
      console.error('Error rejecting note:', error);
      return null;
    }
  }

  static async deleteNote(noteId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete note');
      }

      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error; // Re-throw the error to be handled by the component
    }
  }
}
