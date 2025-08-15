import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const noteStatusEnum = pgEnum('note_status', ['pending', 'approved', 'rejected']);

export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  course: text('course').notNull(),
  professor: text('professor').notNull(),
  semester: text('semester').notNull(),
  description: text('description'),
  fileKey: text('file_key').notNull(), // S3 object key
  fileName: text('file_name').notNull(),
  fileSize: text('file_size').notNull(),
  fileType: text('file_type').notNull(),
  status: noteStatusEnum('status').default('pending'),
  uploadedBy: uuid('uploaded_by').notNull(), // references users.id
  approvedBy: uuid('approved_by'), // references users.id
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
