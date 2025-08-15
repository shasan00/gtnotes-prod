"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const notesService_1 = require("../services/notesService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Configure multer for memory storage (files will be stored in memory before S3 upload)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});
// Upload a new note
router.post('/upload', auth_1.isAuthenticated, upload.single('file'), async (req, res) => {
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
        const note = await notesService_1.NotesService.createNote({
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
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload note' });
    }
});
// Get all notes (public endpoint)
router.get('/', async (req, res) => {
    try {
        const notes = await notesService_1.NotesService.getAllNotes();
        res.json({ notes });
    }
    catch (error) {
        console.error('Get all notes error:', error);
        res.status(500).json({ error: error.message || 'Failed to get notes' });
    }
});
// Get notes uploaded by the current user
router.get('/my-notes', auth_1.isAuthenticated, async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const notes = await notesService_1.NotesService.getNotesByUser(req.user.id);
        res.json({ notes });
    }
    catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: error.message || 'Failed to get notes' });
    }
});
// Get a specific note by ID
router.get('/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;
        const note = await notesService_1.NotesService.getNoteById(noteId);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({ note });
    }
    catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({ error: error.message || 'Failed to get note' });
    }
});
// Delete a note (only by owner)
router.delete('/:noteId', auth_1.isAuthenticated, async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { noteId } = req.params;
        await notesService_1.NotesService.deleteNote(noteId, req.user.id);
        res.json({ message: 'Note deleted successfully' });
    }
    catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete note' });
    }
});
// Admin routes for approval workflow
router.get('/admin/pending', auth_1.isAuthenticated, auth_1.isAdmin, async (req, res) => {
    try {
        const notes = await notesService_1.NotesService.getPendingNotes();
        res.json({ notes });
    }
    catch (error) {
        console.error('Get pending notes error:', error);
        res.status(500).json({ error: error.message || 'Failed to get pending notes' });
    }
});
router.post('/admin/:noteId/approve', auth_1.isAuthenticated, auth_1.isAdmin, async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { noteId } = req.params;
        const [updatedNote] = await notesService_1.NotesService.approveNote(noteId, req.user.id);
        res.json({
            message: 'Note approved successfully',
            note: updatedNote,
        });
    }
    catch (error) {
        console.error('Approve note error:', error);
        res.status(500).json({ error: error.message || 'Failed to approve note' });
    }
});
router.post('/admin/:noteId/reject', auth_1.isAuthenticated, auth_1.isAdmin, async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { noteId } = req.params;
        const updatedNote = await notesService_1.NotesService.rejectNote(noteId, req.user.id);
        res.json({
            message: 'Note rejected successfully',
            note: updatedNote,
        });
    }
    catch (error) {
        console.error('Reject note error:', error);
        res.status(500).json({ error: error.message || 'Failed to reject note' });
    }
});
exports.default = router;
