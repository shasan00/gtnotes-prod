# AWS Lambda Deployment Guide

This guide will help you deploy your GTNotes backend to AWS Lambda using the Serverless Framework.

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS CLI**: Install and configure AWS CLI
3. **Node.js**: Version 22 or higher
4. **Serverless Framework**: Install globally with `npm install -g serverless`

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the environment template and fill in your values:

```bash
cp env.example .env
```

Update the `.env` file with your actual values:
- Database connection string
- JWT and session secrets
- OAuth provider credentials
- AWS S3 bucket name
- AWS region

### 3. Configure AWS Credentials

Set up your AWS credentials using one of these methods:

**Option A: AWS CLI**
```bash
aws configure
```

**Option B: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-1
```

### 4. Deploy to AWS Lambda

**Development deployment:**
```bash
npm run deploy
```

**Production deployment:**
```bash
npm run deploy:prod
```

### 5. Get Your API Endpoint

After deployment, you'll get an API Gateway URL like:
```
https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/
```

## Frontend Deployment Options

### Option 1: AWS Amplify (Recommended)
- Easy deployment from Git repository
- Automatic builds and deployments
- Built-in CI/CD

### Option 2: S3 + CloudFront
- Static hosting on S3
- CDN distribution with CloudFront
- Manual deployment process

## Environment Variables for Frontend

Update your frontend environment variables to point to your Lambda API:

```env
VITE_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
```

## Local Development

For local development with serverless:

```bash
npm run dev:serverless
```

This will start the serverless offline plugin on port 4000.

## Troubleshooting

### Common Issues

1. **Cold Start Performance**: Lambda functions may have cold starts. Consider using provisioned concurrency for production.

2. **Database Connections**: Ensure your database is accessible from AWS Lambda (RDS, Aurora, or external database with proper security groups).

3. **File Uploads**: For large file uploads, consider using presigned URLs or direct S3 uploads.

4. **Session Management**: Lambda functions are stateless. Consider using DynamoDB or external session storage.

### Useful Commands

```bash
# View logs
serverless logs -f api

# Remove deployment
npm run remove

# Deploy to specific stage
serverless deploy --stage production

# Invoke function locally
serverless invoke local -f api
```

## Cost Optimization

1. **Memory Allocation**: Start with 512MB and adjust based on performance
2. **Timeout Settings**: Set appropriate timeouts (default: 30 seconds)
3. **Reserved Concurrency**: For production workloads
4. **Provisioned Concurrency**: For consistent performance

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **IAM Roles**: Use least privilege principle
3. **VPC Configuration**: If using RDS, consider VPC configuration
4. **API Gateway**: Configure CORS and rate limiting as needed
