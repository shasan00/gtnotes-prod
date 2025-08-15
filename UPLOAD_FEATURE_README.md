# PDF Upload Feature Implementation

This document describes the implementation of the PDF upload feature for the GT Notes application.

## Overview

The PDF upload feature allows authenticated users to upload PDF files with metadata (title, course, professor, semester, description) to AWS S3. The metadata is stored in a PostgreSQL database, and the system includes an approval workflow for admin users.

## Backend Implementation

### Dependencies Added
- `multer` - File upload handling
- `@aws-sdk/client-s3` - AWS S3 client
- `@aws-sdk/s3-request-presigner` - S3 signed URLs
- `drizzle-orm` - Database ORM

### Database Schema
The `notes` table includes:
- Basic metadata (title, course, professor, semester, description)
- File information (S3 key, filename, size, type)
- Status tracking (pending, approved, rejected)
- User relationships (uploader, approver)
- Timestamps

### Key Components

#### 1. S3Service (`backend/src/services/s3Service.ts`)
- Handles file uploads to AWS S3
- Generates unique file keys
- Manages file deletion
- Creates signed download URLs

#### 2. NotesService (`backend/src/services/notesService.ts`)
- Business logic for note operations
- CRUD operations for notes
- Approval workflow management
- Integration with S3 service

#### 3. Notes Routes (`backend/src/routes/notes.ts`)
- RESTful API endpoints
- File upload handling with multer
- Authentication and authorization
- Admin approval endpoints

## Frontend Implementation

### UploadPage Updates
- Added title field to the form
- Restricted file types to PDF only
- Integrated with backend API
- Real-time upload progress and feedback

### Form Fields
1. **Title** - Descriptive name for the notes
2. **Course** - Course code (e.g., CS 1331)
3. **Professor** - Instructor name
4. **Semester** - Academic term
5. **Description** - Optional detailed description
6. **File** - PDF file upload (max 10MB)

## API Endpoints

### Public Endpoints
- `GET /api/notes/:noteId` - Get note details

### Authenticated Endpoints
- `POST /api/notes/upload` - Upload new note
- `GET /api/notes/my-notes` - Get user's notes
- `DELETE /api/notes/:noteId` - Delete note (owner only)

### Admin Endpoints
- `GET /api/notes/admin/pending` - Get pending notes
- `POST /api/notes/admin/:noteId/approve` - Approve note
- `POST /api/notes/admin/:noteId/reject` - Reject note

## Environment Variables Required

Create a `.env` file in the backend directory with:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/gtnotes

# Session
SESSION_SECRET=your_session_secret_here
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   pnpm install
   ```

2. **Set Environment Variables**
   - Copy the example environment variables above
   - Fill in your AWS credentials and database connection

3. **Create S3 Bucket**
   - Create an S3 bucket for file storage
   - Configure appropriate permissions
   - Update the bucket name in environment variables

4. **Start the Backend**
   ```bash
   pnpm dev
   ```

5. **Test the Feature**
   - Navigate to the upload page
   - Upload a PDF file with metadata
   - Check the database and S3 for the uploaded file

## Security Features

- File type validation (PDF only)
- File size limits (10MB max)
- Authentication required for uploads
- User ownership validation for deletions
- Admin-only approval workflow

## Future Enhancements

- File preview functionality
- Bulk upload support
- Advanced search and filtering
- File versioning
- Integration with course catalog
- Automated content moderation

## Troubleshooting

### Common Issues

1. **S3 Upload Failures**
   - Verify AWS credentials
   - Check S3 bucket permissions
   - Ensure bucket exists in specified region

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check PostgreSQL service status
   - Ensure database exists

3. **File Upload Errors**
   - Verify file is PDF format
   - Check file size (max 10MB)
   - Ensure user is authenticated

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in your environment variables.
