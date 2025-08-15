import { getDb } from '../db';
import { notes, NewNote } from '../db/schema';
import { S3Service, UploadParams } from './s3Service';
import { eq } from 'drizzle-orm';

export interface CreateNoteParams {
  title: string;
  course: string;
  professor: string;
  semester: string;
  description?: string;
  file: Express.Multer.File;
  userId: string;
}

export class NotesService {
  static async createNote(params: CreateNoteParams): Promise<NewNote> {
    const { file, userId, ...noteData } = params;
    
    // Upload file to S3
    const fileKey = await S3Service.uploadFile({
      file,
      userId,
      course: noteData.course,
      semester: noteData.semester,
    });

    // Create note record in database
    const newNote: NewNote = {
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

    const [createdNote] = await getDb().insert(notes).values(newNote).returning();
    return createdNote;
  }

  static async getAllNotes() {
    // public notes: only approved
    return await getDb()
      .select()
      .from(notes)
      .where(eq(notes.status, 'approved'))
      .orderBy(notes.createdAt);
  }

  static async getNotesByUser(userId: string) {
    return await getDb().select().from(notes).where(eq(notes.uploadedBy, userId));
  }

  static async getPendingNotes() {
    return await getDb().select().from(notes).where(eq(notes.status, 'pending'));
  }

  static async approveNote(noteId: string, adminUserId: string) {
    return await getDb()
      .update(notes)
      .set({ 
        status: 'approved', 
        approvedBy: adminUserId,
        updatedAt: new Date()
      })
      .where(eq(notes.id, noteId))
      .returning();
  }
  
   /* *********************** TODO REVIEW THIS ****************************** */
  static async rejectNote(noteId: string, adminUserId: string) {
 

    // gets note from db
    const [note] = await getDb().select().from(notes).where(eq(notes.id, noteId));
    if (!note) {
      throw new Error('Note not found'); // could remove since note will always be found
    }

    // deletes from s3
    await S3Service.deleteFile(note.fileKey);

    // removes from db
    await getDb().delete(notes).where(eq(notes.id, noteId));

    
    return { // returns the deleted note payload for client confirmation
      ...note,
      status: 'rejected',
      approvedBy: adminUserId,
      updatedAt: new Date(),
    };
  }

  static async getNoteById(noteId: string) {
    const [note] = await getDb().select().from(notes).where(eq(notes.id, noteId));
    
    if (!note) {
      return null;
    }
    
    // Generate a pre-signed URL for the file
    const fileUrl = await S3Service.getFileUrl(note.fileKey);
    
    return {
      ...note,
      fileUrl,
    };
  }

  static async deleteNote(noteId: string, userId: string) {
    // Get the note to check ownership and get file key
    const [note] = await getDb().select().from(notes).where(eq(notes.id, noteId));
    
    if (!note) {
      throw new Error('Note not found');
    }

    // Only allow deletion if user owns the note or is admin
    if (note.uploadedBy !== userId) {
      throw new Error('Unauthorized to delete this note');
    }

    // Delete from S3 first
    await S3Service.deleteFile(note.fileKey);

    // Delete from database
    return await getDb().delete(notes).where(eq(notes.id, noteId)).returning();
  }


}
