# Socket.io Server - Deployment Guide

## Why Separate Socket.io Server?

**Vercel (Next.js) Limitations:**
- Vercel uses serverless functions that have a maximum execution time (10 seconds for Hobby, 60 seconds for Pro)
- WebSockets require persistent connections, which serverless functions cannot maintain
- Each serverless function invocation is stateless and short-lived
- Socket.io needs a long-running process to maintain connections

**Solution:**
- Deploy Socket.io server separately on platforms that support persistent connections
- Next.js (Vercel) handles HTTP requests and serves the frontend
- Socket.io server (Render/Railway) handles WebSocket connections
- They communicate via the Socket.io protocol over the network

## Architecture

```
┌─────────────────┐         HTTP/HTTPS         ┌──────────────────┐
│                 │ ──────────────────────────> │                  │
│  Next.js App    │                             │  Socket.io       │
│  (Vercel)       │ <────────────────────────── │  Server          │
│                 │      WebSocket (WS/WSS)     │  (Render/Railway)│
└─────────────────┘                             └──────────────────┘
       │                                                  │
       │                                                  │
       └──────────────────┬──────────────────────────────┘
                          │
                   ┌──────▼──────┐
                   │  MongoDB    │
                   │   Atlas     │
                   └─────────────┘
```

## Directory Structure

The `socket-server` directory is self-contained and includes all necessary files:

```
socket-server/
├── index.js              # Main server file
├── package.json          # Dependencies
├── .env.example          # Environment variables template
├── lib/
│   └── db.js            # MongoDB connection (CommonJS)
└── models/              # Mongoose models (CommonJS)
    ├── Message.js
    ├── Notification.js
    ├── VitalProfile.js
    └── GuardianProfile.js
```

**Important:** All files in `socket-server` are CommonJS (`.js`) to work with Node.js without TypeScript compilation.

## Environment Variables

### For Next.js (.env.local)
```env
# Socket.io Server URL (your Render/Railway deployment)
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com

# Your Vercel deployment URL
NEXT_PUBLIC_URL=https://your-app.vercel.app
NEXTAUTH_URL=https://your-app.vercel.app
```

### For Socket.io Server (Render/Railway)
```env
# MongoDB (same as Next.js)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/careconnect

# Server Configuration
PORT=3002
NODE_ENV=production

# CORS - Your Vercel URL
NEXT_PUBLIC_URL=https://your-app.vercel.app
NEXTAUTH_URL=https://your-app.vercel.app
```

## Deployment Steps

### Option 1: Render.com

1. **Create a new Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service:**
   - **Name:** `careconnect-socket-server`
   - **Environment:** `Node`
   - **Build Command:** `cd socket-server && npm install`
   - **Start Command:** `cd socket-server && npm start`
   - **Root Directory:** Leave empty (or set to project root)

3. **Set Environment Variables:**
   - Add all variables from `.env.example`
   - **Important:** Set `NEXT_PUBLIC_URL` to your Vercel deployment URL

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the service URL (e.g., `https://careconnect-socket.onrender.com`)

5. **Update Next.js:**
   - Add `NEXT_PUBLIC_SOCKET_URL=https://careconnect-socket.onrender.com` to Vercel environment variables
   - Redeploy Next.js app

### Option 2: Railway.app

1. **Create a new project:**
   - Go to [Railway Dashboard](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure the service:**
   - Select your repository
   - Railway will auto-detect Node.js
   - Set **Root Directory:** `socket-server`
   - Set **Start Command:** `npm start`

3. **Set Environment Variables:**
   - Go to "Variables" tab
   - Add all variables from `.env.example`

4. **Deploy:**
   - Railway will auto-deploy
   - Copy the generated URL (e.g., `https://careconnect-socket.up.railway.app`)

5. **Update Next.js:**
   - Add `NEXT_PUBLIC_SOCKET_URL` to Vercel with the Railway URL
   - Redeploy Next.js app

## Testing Locally

1. **Start Socket.io Server:**
   ```bash
   cd socket-server
   npm install
   npm start
   ```

2. **Start Next.js (in another terminal):**
   ```bash
   npm run dev
   ```

3. **Set environment variables:**
   - `.env.local` should have: `NEXT_PUBLIC_SOCKET_URL=http://localhost:3002`

## Common Issues & Solutions

### Issue 1: CORS Errors
**Symptom:** Browser console shows CORS errors when connecting to socket.

**Solution:**
- Ensure `NEXT_PUBLIC_URL` and `NEXTAUTH_URL` in socket server match your Vercel URL exactly
- Check that the origin is in the `allowedOrigins` array in `index.js`
- For development, add `http://localhost:3000` to allowed origins

### Issue 2: Connection Timeout
**Symptom:** Socket.io client can't connect to server.

**Solution:**
- Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly in Vercel
- Check that the socket server is running and accessible
- Test the health endpoint: `https://your-socket-server.onrender.com/health`
- Ensure firewall/network allows WebSocket connections (port 443 for HTTPS)

### Issue 3: Multiple Socket Connections
**Symptom:** Multiple socket instances created, causing duplicate messages.

**Solution:**
- Always use `getSocket()` from `lib/socket.ts` (singleton pattern)
- Don't create new `io()` instances directly
- Clean up event listeners in `useEffect` cleanup function

### Issue 4: Messages Not Received
**Symptom:** Messages sent but not received by other clients.

**Solution:**
- Verify both clients joined the same room (check `chatId` format)
- Check server logs to see if messages are being broadcast
- Ensure `room-joined` event is received after `join-room`
- Verify MongoDB connection is working

### Issue 5: Render/Railway Free Tier Limitations
**Symptom:** Server goes to sleep after inactivity.

**Solution:**
- **Render:** Free tier spins down after 15 minutes of inactivity
  - Upgrade to paid plan for always-on
  - Or use a cron job to ping the health endpoint
- **Railway:** Free tier has usage limits
  - Monitor usage in dashboard
  - Consider upgrading if needed

## Production Checklist

- [ ] Socket.io server deployed and accessible
- [ ] Health endpoint returns 200 OK
- [ ] `NEXT_PUBLIC_SOCKET_URL` set in Vercel
- [ ] CORS configured with production Vercel URL
- [ ] MongoDB connection working
- [ ] Tested sending/receiving messages
- [ ] Tested reconnection after network issues
- [ ] Monitoring/logging set up (optional but recommended)
- [ ] Error handling tested

## Monitoring

Consider adding:
- Uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (Sentry)
- Log aggregation (Logtail, LogDNA)
- Performance monitoring (New Relic)

