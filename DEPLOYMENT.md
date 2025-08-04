# Deployment Guide for Vercel

## Prerequisites

1. **MongoDB Atlas Database**: Set up a MongoDB Atlas cluster and get your connection string
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Environment Variables**: Configure the following in your Vercel project settings

## Environment Variables

Set these in your Vercel project dashboard under Settings > Environment Variables:

```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/web3job?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
```

## Deployment Steps

1. **Connect your GitHub repository to Vercel**
2. **Configure the project settings**:
   - Framework Preset: Other
   - Root Directory: `./` (root of the repository)
   - Build Command: Leave empty (handled by vercel.json)
   - Output Directory: Leave empty (handled by vercel.json)

3. **Deploy**: Vercel will automatically detect the configuration and deploy both client and server

## Project Structure

- `/client` - React frontend (Vite)
- `/server` - Node.js/Express backend
- `/vercel.json` - Main Vercel configuration
- `/client/vercel.json` - Client-specific configuration
- `/server/vercel.json` - Server-specific configuration

## Troubleshooting

### Common Issues:

1. **Build Errors**: Check that all dependencies are properly installed
2. **Database Connection**: Ensure MONGODB_URI is correctly set
3. **CORS Issues**: Verify CLIENT_URL matches your deployed frontend URL
4. **JWT Errors**: Make sure JWT_SECRET is set and secure

### Error Codes:

- `FUNCTION_INVOCATION_FAILED`: Check server logs for specific errors
- `DEPLOYMENT_BLOCKED`: Verify environment variables are set
- `NOT_FOUND`: Check routing configuration in vercel.json

## API Endpoints

After deployment, your API will be available at:
- `https://your-app.vercel.app/api/auth`
- `https://your-app.vercel.app/api/jobs`
- `https://your-app.vercel.app/api/users`
- `https://your-app.vercel.app/api/payments`

## Health Check

Test your deployment by visiting:
`https://your-app.vercel.app/health`

This should return: `{"status":"OK","timestamp":"..."}` 