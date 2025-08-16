# Better Auth Setup Guide

This guide explains how to properly configure Better Auth in your project according to the official documentation.

## Required Environment Variables

You **MUST** set these environment variables for Better Auth to work:

### 1. BETTER_AUTH_SECRET
A random secret key used for encryption and hashing. Generate one using:
```bash
openssl rand -base64 32
```

### 2. BETTER_AUTH_URL
The base URL of your auth server. For production, this should be:
```
BETTER_AUTH_URL=https://7m66fwf69g.execute-api.us-east-2.amazonaws.com/production
```

## Current Configuration Issues

Your current setup has several issues that need to be fixed:

### 1. Missing Required Variables
- ❌ `BETTER_AUTH_SECRET` is not set
- ❌ `BETTER_AUTH_URL` is not set

### 2. Database Schema
According to the Better Auth documentation, you should use the CLI to generate the required database schema:

```bash
# Install the CLI
npm install -g @better-auth/cli

# Generate schema for your database
npx @better-auth/cli generate

# Or migrate directly (if using Kysely adapter)
npx @better-auth/cli migrate
```

### 3. Environment Setup
Copy `env.template` to `.env` and fill in the values:

```bash
cp env.template .env
```

## Required Changes

1. **Set BETTER_AUTH_SECRET** - Generate a random secret
2. **Set BETTER_AUTH_URL** - Your production API Gateway URL
3. **Generate Database Schema** - Use the Better Auth CLI
4. **Redeploy Backend** - After making these changes

## Testing CORS

After fixing the configuration, test CORS with:

```bash
# Test health endpoint
curl -H "Origin: https://main.d2rs71o2mqiojg.amplifyapp.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://7m66fwf69g.execute-api.us-east-2.amazonaws.com/production/api/health

# Test CORS endpoint
curl -H "Origin: https://main.d2rs71o2mqiojg.amplifyapp.com" \
     https://7m66fwf69g.execute-api.us-east-2.amazonaws.com/production/api/test-cors
```

## Next Steps

1. Generate a secure `BETTER_AUTH_SECRET`
2. Set `BETTER_AUTH_URL` to your production URL
3. Use the Better Auth CLI to generate database schema
4. Redeploy your backend
5. Test CORS functionality

## References

- [Better Auth Installation Guide](https://better-auth.com/docs/installation)
- [Better Auth Basic Usage](https://better-auth.com/docs/basic-usage)
- [Better Auth CLI Documentation](https://better-auth.com/docs/concepts/cli)
