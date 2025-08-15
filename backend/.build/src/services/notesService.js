"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesService = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const s3Service_1 = require("./s3Service");
const drizzle_orm_1 = require("drizzle-orm");
class NotesService {
    static async createNote(params) {
        const { file, userId, ...noteData } = params;
        // Upload file to S3
        const fileKey = await s3Service_1.S3Service.uploadFile({
            file,
            userId,
            course: noteData.course,
            semester: noteData.semester,
        });
        // Create note record in database
        const newNote = {
            title: noteData.title,
            course: noteData.course,
            professor: noteData.professor,
            semester: noteData.semester,
            description: noteData.description,
            fileKey,
            fileName: file.originalname,
            fileSize: file.size.toString(),
            fileType: file.mimetype,
            uploadedBy: userId,
            status: 'pending',
        };
        const [createdNote] = await (0, db_1.getDb)().insert(schema_1.notes).values(newNote).returning();
        return createdNote;
    }
    static async getAllNotes() {
        // public notes: only approved
        return await (0, db_1.getDb)()
            .select()
            .from(schema_1.notes)
            .where((0, drizzle_orm_1.eq)(schema_1.notes.status, 'approved'))
            .orderBy(schema_1.notes.createdAt);
    }
    static async getNotesByUser(userId) {
        return await (0, db_1.getDb)().select().from(schema_1.notes).where((0, drizzle_orm_1.eq)(schema_1.notes.uploadedBy, userId));
    }
    static async getPendingNotes() {
        return await (0, db_1.getDb)().select().from(schema_1.notes).where((0, drizzle_orm_1.eq)(schema_1.notes.status, 'pending'));
    }
    static async approveNote(noteId, adminUserId) {
        return await (0, db_1.getDb)()
            .update(schema_1.notes)
            .set({
            status: 'approved',
            approvedBy: adminUserId,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.notes.id, noteId))
            .returning();
    }
    /* *********************** TODO REVIEW THIS ****************************** */
    static async rejectNote(noteId, adminUserId) {
        // gets note from db
        const [note] = await (0, db_1.getDb)().select().from(schema_1.notes).where((0, drizzle_orm_1.eq)(schema_1.notes.id, noteId));
        if (!note) {
            throw new Error('Note not found'); // could remove since note will always be found
        }
        // deletes from s3
        await s3Service_1.S3Service.deleteFile(note.fileKey);
        // removes from db
        await (0, db_1.getDb)().delete(schema_1.notes).where((0, drizzle_orm_1.eq)(schema_1.notes.id, noteId));
        return {
            ...note,
            status: 'rejected',
            approvedBy: adminUserId,
            updatedAt: new Date(),
        };
    }
    static async getNoteById(noteId) {
        const [note] = await (0, db_1.getDb)().select().from(schema_1.notes).where((0, drizzle_orm_1.eq)(schema_1.notes.id, noteId));
        if (!note) {
            return null;
        }
        // Generate a pre-signed URL for the file
        const fileUrl = await s3Service_1.S3Service.getFileUrl(note.fileKey);
        return {
            ...note,
            fileUrl,
        };
    }
    static async deleteNote(noteId, userId) {
        // Get the note to check ownership and get file key
        const [note] = await (0, db_1.getDb)().select().from(schema_1.notes).where((0, drizzle_orm_1.eq)(schema_1.notes.id, noteId));
        if (!note) {
            throw new Error('Note not found');
        }
        // Only allow deletion if user owns the note or is admin
        if (note.uploadedBy !== userId) {
            throw new Error('Unauthorized to delete this note');
        }
        // Delete from S3 first
        await s3Service_1.S3Service.deleteFile(note.fileKey);
        // Delete from database
        return await (0, db_1.getDb)().delete(schema_1.notes).where((0, drizzle_orm_1.eq)(schema_1.notes.id, noteId)).returning();
    }
}
exports.NotesService = NotesService;
