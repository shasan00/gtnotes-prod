import express from 'express';
import multer from 'multer';
import { NotesService } from '../services/notesService';
import { isAuthenticated, isAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Configure multer for memory storage (files will be stored in memory before S3 upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Upload a new note
router.post('/upload', isAuthenticated, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { title, course, professor, semester, description } = req.body;

    if (!title || !course || !professor || !semester) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const note = await NotesService.createNote({
      title,
      course,
      professor,
      semester,
      description,
      file: req.file,
      userId: req.user.id,
    });

    res.status(201).json({
      message: 'Note uploaded successfully',
      note: {
        id: note.id,
        title: note.title,
        course: note.course,
        professor: note.professor,
        semester: note.semester,
        status: note.status,
        createdAt: note.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload note' });
  }
});

// Get all notes (public endpoint)
router.get('/', async (req, res) => {
  try {
    const notes = await NotesService.getAllNotes();
    res.json({ notes });
  } catch (error: any) {
    console.error('Get all notes error:', error);
    res.status(500).json({ error: error.message || 'Failed to get notes' });
  }
});

// Get notes uploaded by the current user
router.get('/my-notes', isAuthenticated, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notes = await NotesService.getNotesByUser(req.user.id);
    res.json({ notes });
  } catch (error: any) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: error.message || 'Failed to get notes' });
  }
});

// Get a specific note by ID
router.get('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await NotesService.getNoteById(noteId);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ note });
  } catch (error: any) {
    console.error('Get note error:', error);
    res.status(500).json({ error: error.message || 'Failed to get note' });
  }
});

// Delete a note (only by owner)
router.delete('/:noteId', isAuthenticated, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { noteId } = req.params;
    await NotesService.deleteNote(noteId, req.user.id);

    res.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete note' });
  }
});

// Admin routes for approval workflow
router.get('/admin/pending', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const notes = await NotesService.getPendingNotes();
    res.json({ notes });
  } catch (error: any) {
    console.error('Get pending notes error:', error);
    res.status(500).json({ error: error.message || 'Failed to get pending notes' });
  }
});

router.post('/admin/:noteId/approve', isAuthenticated, isAdmin, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { noteId } = req.params;
    const [updatedNote] = await NotesService.approveNote(noteId, req.user.id);

    res.json({
      message: 'Note approved successfully',
      note: updatedNote,
    });
  } catch (error: any) {
    console.error('Approve note error:', error);
    res.status(500).json({ error: error.message || 'Failed to approve note' });
  }
});

router.post('/admin/:noteId/reject', isAuthenticated, isAdmin, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { noteId } = req.params;
    const updatedNote = await NotesService.rejectNote(noteId, req.user.id);

    res.json({
      message: 'Note rejected successfully',
      note: updatedNote,
    });
  } catch (error: any) {
    console.error('Reject note error:', error);
    res.status(500).json({ error: error.message || 'Failed to reject note' });
  }
});

export default router;
