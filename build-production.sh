#!/bin/bash

echo "🚀 Building Unimegle for Production..."

# Build frontend
echo "📦 Building frontend..."
cd my-web
npm run build
echo "✅ Frontend built successfully!"

# Create production environment file
echo "🔧 Creating production environment file..."
cat > .env.production << EOF
VITE_API_URL=https://your-railway-app.railway.app/api
VITE_SOCKET_URL=https://your-railway-app.railway.app
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
EOF

echo "✅ Production environment file created!"

# Build backend
echo "📦 Preparing backend..."
cd ../server
npm install --production
echo "✅ Backend prepared for production!"

echo "🎉 Production build complete!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway"
echo "2. Deploy frontend to Vercel"
echo "3. Update environment variables"
echo "4. Test production deployment"
