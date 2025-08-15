"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let s3Client = null;
let bucketName = null;
function getS3Client() {
    if (!s3Client) {
        const region = process.env.AWS_REGION || 'us-east-1';
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        if (!accessKeyId || !secretAccessKey) {
            throw new Error('AWS credentials not configured');
        }
        s3Client = new client_s3_1.S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }
    return s3Client;
}
function getBucketName() {
    if (!bucketName) {
        const envBucketName = process.env.AWS_S3_BUCKET_NAME;
        if (!envBucketName) {
            throw new Error('AWS_S3_BUCKET_NAME not configured');
        }
        bucketName = envBucketName;
    }
    return bucketName;
}
class S3Service {
    static async uploadFile(params) {
        const { file, userId, course, semester } = params;
        // Generate unique file key
        const timestamp = Date.now();
        const fileKey = `notes/${userId}/${course}/${semester}/${timestamp}-${file.originalname}`;
        const uploadParams = {
            Bucket: getBucketName(),
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            Metadata: {
                userId,
                course,
                semester,
                originalName: file.originalname,
            },
        };
        try {
            await getS3Client().send(new client_s3_1.PutObjectCommand(uploadParams));
            return fileKey;
        }
        catch (error) {
            console.error('S3 upload error:', error);
            throw new Error('Failed to upload file to S3');
        }
    }
    static async deleteFile(fileKey) {
        try {
            await getS3Client().send(new client_s3_1.DeleteObjectCommand({
                Bucket: getBucketName(),
                Key: fileKey,
            }));
        }
        catch (error) {
            console.error('S3 delete error:', error);
            throw new Error('Failed to delete file from S3');
        }
    }
    static async getSignedDownloadUrl(fileKey) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: getBucketName(),
            Key: fileKey,
        });
        // Generate a signed URL for downloading (valid for 1 hour)
        return await (0, s3_request_presigner_1.getSignedUrl)(getS3Client(), command, { expiresIn: 3600 });
    }
    static async getFileUrl(fileKey) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: getBucketName(),
            Key: fileKey,
            ResponseContentDisposition: 'inline'
        });
        // Generate a signed URL for viewing (valid for 1 hour)
        return await (0, s3_request_presigner_1.getSignedUrl)(getS3Client(), command, {
            expiresIn: 3600
        });
    }
}
exports.S3Service = S3Service;
