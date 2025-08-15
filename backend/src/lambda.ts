import serverlessExpress from '@vendia/serverless-express';
import { app } from './app';

// Export the serverless-express handler
export const handler = serverlessExpress({ app });
