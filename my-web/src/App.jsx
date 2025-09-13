import './App.css'
import VideoChat from './components/VideoChat.jsx'
import FirebaseAuth from './components/FirebaseAuth.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useEffect, useState } from 'react'

function AppContent() {
  const { currentUser } = useAuth()
  const [guestMode, setGuestMode] = useState(false)

  useEffect(() => {
    // Check if we should enable guest mode (fallback)
    const enableGuestMode = () => {
      setGuestMode(true)
    }
    
    // You can add logic here to determine if guest mode should be enabled
    // For now, we'll only show guest mode if there's no Firebase config
    const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY || 
                             window.location.hostname === 'localhost'
    
    if (!hasFirebaseConfig) {
      enableGuestMode()
    }
  }, [])

  return (
    <div className="app-root">
      {currentUser || guestMode ? (
        <>
          {guestMode && !currentUser && (
            <div style={{position:'absolute', top:8, left:8, right:8, textAlign:'center', fontSize:12, opacity:0.8}}>
              Running in guest mode (no login). Configure Firebase to enable authentication.
            </div>
          )}
          <VideoChat />
        </>
      ) : (
        <FirebaseAuth onAuthed={() => {}} />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
