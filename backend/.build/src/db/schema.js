"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notes = exports.noteStatusEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.noteStatusEnum = (0, pg_core_1.pgEnum)('note_status', ['pending', 'approved', 'rejected']);
exports.notes = (0, pg_core_1.pgTable)('notes', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    title: (0, pg_core_1.text)('title').notNull(),
    course: (0, pg_core_1.text)('course').notNull(),
    professor: (0, pg_core_1.text)('professor').notNull(),
    semester: (0, pg_core_1.text)('semester').notNull(),
    description: (0, pg_core_1.text)('description'),
    fileKey: (0, pg_core_1.text)('file_key').notNull(), // S3 object key
    fileName: (0, pg_core_1.text)('file_name').notNull(),
    fileSize: (0, pg_core_1.text)('file_size').notNull(),
    fileType: (0, pg_core_1.text)('file_type').notNull(),
    status: (0, exports.noteStatusEnum)('status').default('pending'),
    uploadedBy: (0, pg_core_1.uuid)('uploaded_by').notNull(), // references users.id
    approvedBy: (0, pg_core_1.uuid)('approved_by'), // references users.id
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
