# 🚀 Quick Deploy Guide

## ⚡ Fastest Way to Go Live

### Option 1: One-Click Deploy (Recommended)

#### Backend (Railway)
1. Go to https://railway.app
2. Click "Deploy from GitHub"
3. Select your repository
4. Choose "server" folder
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=4000
   CORS_ORIGIN=https://your-app.vercel.app
   JWT_SECRET=your-secret-key
   ALLOW_GUESTS=true
   ```
6. Deploy!

#### Frontend (Vercel)
1. Go to https://vercel.com
2. Click "Import Project"
3. Select your repository
4. Choose "my-web" folder
5. Add environment variables:
   ```
   VITE_API_URL=https://your-railway-app.railway.app/api
   VITE_SOCKET_URL=https://your-railway-app.railway.app
   VITE_FIREBASE_API_KEY=your-key
   VITE_FIREBASE_AUTH_DOMAIN=your-domain
   VITE_FIREBASE_PROJECT_ID=your-id
   VITE_FIREBASE_STORAGE_BUCKET=your-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```
6. Deploy!

### Option 2: Manual Deploy

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Deploy Backend**:
   - Railway will auto-deploy from GitHub
   - Get your Railway URL

3. **Deploy Frontend**:
   - Vercel will auto-deploy from GitHub
   - Update environment variables with Railway URL

## 🎯 Production URLs

After deployment, your app will be live at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-railway-app.railway.app

## ✅ Test Production

1. Visit your Vercel URL
2. Test login/guest mode
3. Test video chat
4. Test matchmaking

## 🌍 Global Access

Your app will be accessible worldwide!
- Students can use it from any country
- Mobile and desktop support
- Real-time video chat
- Smart matchmaking

---

**Ready to deploy?** Follow the steps above and your app will be live in minutes! 🎉
