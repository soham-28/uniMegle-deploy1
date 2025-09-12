import './App.css'
import VideoChat from './components/VideoChat.jsx'
import Auth from './components/Auth.jsx'
import { useEffect, useState } from 'react'
import { session } from './api'

function App() {
  const [authed, setAuthed] = useState(false)
  const [guestMode, setGuestMode] = useState(false)

  useEffect(() => {
    session()
      .then(r => {
        if (r && r.authenticated) setAuthed(true)
        else setGuestMode(true)
      })
      .catch(() => {
        setGuestMode(true)
      })
  }, [])

  return (
    <div className="app-root">
      {authed || guestMode ? (
        <>
          {guestMode && (
            <div style={{position:'absolute', top:8, left:8, right:8, textAlign:'center', fontSize:12, opacity:0.8}}>
              Running in guest mode (no login). Start PostgreSQL to enable auth.
            </div>
          )}
          <VideoChat />
        </>
      ) : (
        <Auth onAuthed={() => setAuthed(true)} />
      )}
    </div>
  )
}

export default App
