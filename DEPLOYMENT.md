# Deployment Guide - AdGen Co-Pilot

## Overview
This guide provides step-by-step instructions for deploying the AdGen Co-Pilot application to production.

## Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Cloudinary account (for image hosting)
- Ollama installed (for local LLM processing) - OR - Access to remote Ollama instance

## Environment Setup

### 1. Server Environment Variables
Create `/server/.env` with the following:

```env
# Server Configuration
PORT=5000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
```

### 2. Client Environment Variables
Create `/client/.env` with the following:

```env
VITE_API_URL=http://localhost:5000
```

For production, update `VITE_API_URL` to your server's production URL.

## Local Development

### 1. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start Development Servers
```bash
# Terminal 1 - Start the backend server
cd server
npm run dev

# Terminal 2 - Start the frontend
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Production Build

### 1. Build the Client
```bash
cd client
npm run build
```

This creates an optimized production build in `/client/dist`.

### 2. Preview Production Build (Optional)
```bash
npm run preview
```

## Deployment Options

### Option 1: Deploy to Vercel (Recommended for Frontend)

#### Frontend (Client)
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy from `/client` directory:
   ```bash
   cd client
   vercel
   ```

3. Set environment variable in Vercel dashboard:
   - `VITE_API_URL`: Your backend API URL

#### Backend (Server)
- Deploy separately to a Node.js hosting service (Railway, Render, Heroku, etc.)

### Option 2: Deploy to Railway

1. Create a Railway account at https://railway.app
2. Create two services:
   - **Frontend**: Point to `/client` directory
   - **Backend**: Point to `/server` directory
3. Add environment variables for each service
4. Deploy

### Option 3: Deploy to Render

#### Backend
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Add environment variables from server .env

#### Frontend
1. Create a new Static Site on Render
2. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Add `VITE_API_URL` environment variable

### Option 4: Single Server Deployment

You can serve the frontend build from the Express server:

1. Build the client:
   ```bash
   cd client
   npm run build
   ```

2. Modify `server/index.js` to serve static files:
   ```javascript
   // Add after other middleware
   app.use(express.static(path.join(__dirname, '../client/dist')));
   
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../client/dist/index.html'));
   });
   ```

3. Start the server:
   ```bash
   cd server
   npm start
   ```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test image upload functionality
- [ ] Test PDF analysis with Ollama
- [ ] Test export functionality for PNG, JPEG, and WebP
- [ ] Verify Cloudinary integration is working
- [ ] Test all templates load correctly
- [ ] Verify auto-save and project load/save functionality
- [ ] Test undo/redo functionality
- [ ] Check browser console for any errors
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design on mobile devices

## Performance Optimization

### Client-Side
- Vite automatically code-splits and optimizes
- All images should be served from Cloudinary
- Consider implementing lazy loading for templates

### Server-Side
- Implement caching for frequently accessed data
- Use compression middleware (already recommended in README)
- Consider implementing rate limiting for API endpoints

## Monitoring & Logging

### Recommended Tools
- **Frontend**: Vercel Analytics, Google Analytics
- **Backend**: Winston or Pino for logging
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot or Pingdom

## Security Best Practices

1. **Never commit `.env` files** - Already in .gitignore
2. **Use HTTPS** in production
3. **Implement rate limiting** on API endpoints
4. **Validate all user inputs** server-side
5. **Keep dependencies updated**: Run `npm audit` regularly
6. **Set appropriate CORS policies** in production

## Scaling Considerations

### If Traffic Increases:
1. **CDN**: Use Cloudinary's CDN for all images
2. **Caching**: Implement Redis for session/state caching
3. **Load Balancing**: Use multiple server instances
4. **Database**: Consider moving project data to MongoDB/PostgreSQL
5. **Ollama**: Consider remote Ollama instance or dedicated GPU server

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Clear build cache: `rm -rf dist .vite`

2. **Cloudinary Upload Fails**
   - Verify API credentials
   - Check file size limits
   - Ensure network connectivity

3. **Ollama Analysis Fails**
   - Verify Ollama is running: `ollama list`
   - Check OLLAMA_URL environment variable
   - Verify model is downloaded: `ollama pull llama3.2:1b`

4. **Frontend Can't Connect to Backend**
   - Check VITE_API_URL in client .env
   - Verify CORS settings in server
   - Check server is running

## Backup & Recovery

### Important Data to Backup:
- **Projects**: Stored in browser localStorage (consider implementing cloud sync)
- **Uploaded Images**: Stored in Cloudinary (backed up automatically)
- **Guidelines**: PDF analysis stored temporarily

### Disaster Recovery:
- Keep environment variables backed up securely
- Maintain version control with Git
- Document all custom configurations

## Support & Maintenance

### Regular Maintenance Tasks:
- [ ] Update dependencies monthly: `npm update`
- [ ] Review security advisories: `npm audit`
- [ ] Monitor error logs
- [ ] Review and optimize slow API endpoints
- [ ] Clean up old Cloudinary uploads
- [ ] Test critical user flows quarterly

## Contact
For deployment issues or questions, refer to the main README.md or contact the development team.

---

**Last Updated**: January 2025
**Version**: 1.0.0
