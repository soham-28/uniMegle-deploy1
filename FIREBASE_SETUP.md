# Firebase Authentication Setup Guide

## Overview
Your application now uses Firebase Authentication with email domain validation. Only users with emails from `@adypu.edu.in` and `@scmspune.ac.in` can create accounts and login.

## Setup Steps

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "unimegle")
4. Follow the setup wizard

### 2. Enable Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Optionally, enable "Email link (passwordless sign-in)" for better UX

### 3. Get Firebase Configuration
1. In your Firebase project, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 4. Configure Environment Variables
1. Create a `.env` file in the `my-web` directory
2. Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Test the Application
1. Start your development server: `npm run dev`
2. Try to sign up with an allowed email domain
3. Check your email for verification link
4. Login with verified account

## Features

### Email Domain Validation
- Only emails ending with `@adypu.edu.in` or `@scmspune.ac.in` are allowed
- Easy to add more domains by editing the `ALLOWED_EMAIL_DOMAINS` array in `src/firebase.js`

### Authentication Flow
1. **Signup**: User creates account with valid email domain
2. **Email Verification**: Firebase sends verification email
3. **Login**: User can only login after email verification
4. **Session Management**: Automatic login state management

### Security Features
- Email domain whitelist
- Email verification required
- Secure password requirements (minimum 6 characters)
- Firebase handles all security aspects

## Adding More Email Domains

To allow more educational institutions, edit `src/firebase.js`:

```javascript
export const ALLOWED_EMAIL_DOMAINS = [
  '@adypu.edu.in',
  '@scmspune.ac.in',
  '@newuniversity.edu',  // Add new domains here
  '@anothercollege.ac.in'
];
```

## Troubleshooting

### Common Issues
1. **"Email domain not allowed"**: Check if the email domain is in the allowed list
2. **"Please verify your email"**: User needs to click the verification link in their email
3. **Firebase config errors**: Ensure all environment variables are set correctly

### Development Mode
- If Firebase is not configured, the app will run in guest mode
- Guest mode allows access without authentication for development

## File Structure
```
my-web/src/
├── firebase.js              # Firebase configuration and domain validation
├── contexts/
│   └── AuthContext.jsx      # Firebase authentication context
├── components/
│   └── FirebaseAuth.jsx     # Login/signup component
└── App.jsx                  # Main app with Firebase integration
```

## Next Steps
1. Set up your Firebase project
2. Configure environment variables
3. Test with allowed email domains
4. Deploy to production with proper Firebase configuration


