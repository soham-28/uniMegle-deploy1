import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'
import WaitingScreen from './WaitingScreen'

export default function VideoChat() {
  const { currentUser, logout } = useAuth()
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [stream, setStream] = useState(null)
  const [socket, setSocket] = useState(null)
  const pcRef = useRef(null)
  const roomIdRef = useRef(null)
  const roleRef = useRef(null)
  const tracksAddedRef = useRef(false)
  const [remoteReady, setRemoteReady] = useState(false)
  const [remoteMuted, setRemoteMuted] = useState(true)
  const [connectionState, setConnectionState] = useState('new')
  const [isWaiting, setIsWaiting] = useState(true)
  const [activeUsers, setActiveUsers] = useState(0)
  const [waitingTime, setWaitingTime] = useState(0)
  const remoteStreamRef = useRef(null)
  const waitingIntervalRef = useRef(null)

  useEffect(() => {
    let currentStream
    const start = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        })
        setStream(currentStream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = currentStream
        }
        console.log('Media stream obtained successfully:', currentStream.getTracks().length, 'tracks')
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Media error', e)
        alert('Failed to access camera/microphone. Please check permissions and try again.')
      }
    }
    start()
    console.log('Attempting to connect to:', import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000')
    const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', { 
      withCredentials: true,
      transports: ['websocket', 'polling'],
      forceNew: true,
      timeout: 60000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
      secure: false,
      rejectUnauthorized: false,
      autoConnect: true,
      upgrade: true
    })
    setSocket(s)
    
    s.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
    
    s.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      // Clear timer on disconnect
      if (waitingIntervalRef.current) {
        clearInterval(waitingIntervalRef.current)
        waitingIntervalRef.current = null
      }
      setIsWaiting(false)
    })
    
    // Auto-connect to queue
    s.on('connect', () => {
      console.log('Connected to server with socket ID:', s.id)
      console.log('Joining queue...')
      setIsWaiting(true)
      setWaitingTime(0)
      s.emit('enqueue')
      
      // Clear any existing timer before starting new one
      if (waitingIntervalRef.current) {
        clearInterval(waitingIntervalRef.current)
      }
      
      // Start waiting timer
      waitingIntervalRef.current = setInterval(() => {
        console.log('Timer tick - waiting time:', waitingTime + 1)
        setWaitingTime(prev => prev + 1)
      }, 1000)
      
      // Request active users count
      s.emit('getActiveUsers')
      console.log('Requested active users count')
    })
    s.on('matched', async ({ roomId, role }) => {
      console.log('Matched with role:', role, 'roomId:', roomId)
      setIsWaiting(false)
      clearInterval(waitingIntervalRef.current)
      roomIdRef.current = roomId
      roleRef.current = role
      
      // Ensure we have the peer connection ready
      await ensurePeer()
      
      // Give a small delay to ensure both peers are ready
      setTimeout(async () => {
        if (role === 'caller') {
          try {
            console.log('Creating offer as caller')
            const offer = await pcRef.current.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            })
            await pcRef.current.setLocalDescription(offer)
            s.emit('signal', { roomId, data: { type: 'offer', sdp: offer.sdp } })
            console.log('Sent offer as caller')
          } catch (error) {
            console.error('Error creating offer:', error)
          }
        }
      }, 500)
    })
    
    s.on('activeUsers', ({ count }) => {
      setActiveUsers(count)
    })
    s.on('signal', async ({ data }) => {
      console.log('Received signal:', data.type)
      await ensurePeer()
      
      try {
        if (data.type === 'offer') {
          console.log('Processing offer')
          await pcRef.current.setRemoteDescription({ type: 'offer', sdp: data.sdp })
          const answer = await pcRef.current.createAnswer()
          await pcRef.current.setLocalDescription(answer)
          s.emit('signal', { roomId: roomIdRef.current, data: { type: 'answer', sdp: answer.sdp } })
          console.log('Sent answer')
        } else if (data.type === 'answer') {
          console.log('Processing answer')
          await pcRef.current.setRemoteDescription({ type: 'answer', sdp: data.sdp })
          console.log('Answer processed successfully')
        } else if (data.type === 'candidate') {
          if (data.candidate && pcRef.current.remoteDescription) {
            try {
              await pcRef.current.addIceCandidate(data.candidate)
              console.log('Added ICE candidate:', data.candidate.type)
            } catch (error) {
              console.error('Error adding ICE candidate:', error)
            }
          } else {
            console.log('Received ICE candidate but no remote description set yet')
          }
        }
      } catch (error) {
        console.error('Error processing signal:', error)
      }
    })

    s.on('peer-left', () => {
      console.log('Peer left the room')
      setRemoteReady(false)
      setRemoteMuted(true)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }
      remoteStreamRef.current = null
    })

    return () => {
      currentStream?.getTracks().forEach(t => t.stop())
      if (pcRef.current) pcRef.current.close()
      clearInterval(waitingIntervalRef.current)
      s.close()
    }
  }, [])

  // If stream becomes available after PC created, add tracks
  useEffect(() => {
    if (stream && pcRef.current && !tracksAddedRef.current) {
      stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream))
      tracksAddedRef.current = true
    }
  }, [stream])

  const toggleCamera = () => {
    if (!stream) return
    stream.getVideoTracks().forEach(t => (t.enabled = !t.enabled))
    setIsCameraOn(v => !v)
  }

  const toggleMic = () => {
    if (!stream) return
    stream.getAudioTracks().forEach(t => (t.enabled = !t.enabled))
    setIsMicOn(v => !v)
  }

  async function ensurePeer() {
    if (pcRef.current) return pcRef.current
    const pc = new RTCPeerConnection({ 
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    })
    pcRef.current = pc
    
    // Initialize remote stream
    remoteStreamRef.current = new MediaStream()
    
    // Add local tracks if available
    if (stream && !tracksAddedRef.current) {
      console.log('Adding local tracks to peer connection')
      stream.getTracks().forEach(track => {
        console.log('Adding track:', track.kind, track.enabled)
        pc.addTrack(track, stream)
      })
      tracksAddedRef.current = true
    }
    
    pc.onicecandidate = (event) => {
      if (event.candidate && roomIdRef.current && socket) {
        console.log('Sending ICE candidate:', event.candidate.type)
        socket.emit('signal', { roomId: roomIdRef.current, data: { type: 'candidate', candidate: event.candidate } })
      } else if (!event.candidate) {
        console.log('ICE gathering complete')
      }
    }
    
    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind, 'enabled:', event.track.enabled, 'readyState:', event.track.readyState)
      console.log('Event streams:', event.streams.length)
      
      // Use the first stream from the event, or create our own
      let remoteStream = event.streams[0]
      if (!remoteStream) {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream()
        }
        remoteStreamRef.current.addTrack(event.track)
        remoteStream = remoteStreamRef.current
      } else {
        remoteStreamRef.current = remoteStream
      }
      
      console.log('Remote stream tracks:', remoteStream.getTracks().length)
      
      // Set up track event listeners
      event.track.onended = () => console.log('Remote track ended:', event.track.kind)
      event.track.onmute = () => {
        console.log('Remote track muted:', event.track.kind)
        if (event.track.kind === 'audio') {
          setRemoteMuted(true)
        }
      }
      event.track.onunmute = () => {
        console.log('Remote track unmuted:', event.track.kind)
        if (event.track.kind === 'audio') {
          setRemoteMuted(false)
        }
      }
      
      // Update remote video element
      if (remoteVideoRef.current && remoteStream.getTracks().length > 0) {
        console.log('Setting remote video srcObject')
        remoteVideoRef.current.srcObject = remoteStream
        setRemoteReady(true)
        
        // Ensure video plays
        setTimeout(() => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.play().catch(e => console.error('Remote video play error:', e))
          }
        }, 100)
      }
    }
    
    pc.onconnectionstatechange = () => {
      console.log('Connection state changed to:', pc.connectionState)
      setConnectionState(pc.connectionState)
      if (pc.connectionState === 'connected') {
        console.log('✅ Peer connection established successfully')
      } else if (pc.connectionState === 'failed') {
        console.log('❌ Peer connection failed')
        setRemoteReady(false)
        // Try to reconnect
        setTimeout(() => {
          if (socket && roomIdRef.current) {
            console.log('Attempting to reconnect...')
            socket.emit('enqueue')
          }
        }, 3000)
      } else if (pc.connectionState === 'disconnected') {
        console.log('⚠️ Peer connection disconnected')
        setRemoteReady(false)
      }
    }
    
    pc.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', pc.iceGatheringState)
    }
    
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state changed to:', pc.iceConnectionState)
      if (pc.iceConnectionState === 'connected') {
        console.log('✅ ICE connection established')
      } else if (pc.iceConnectionState === 'failed') {
        console.log('❌ ICE connection failed - trying to restart')
        // Try ICE restart
        if (pc.signalingState === 'stable') {
          pc.createOffer({ iceRestart: true }).then(offer => {
            pc.setLocalDescription(offer)
            socket.emit('signal', { roomId: roomIdRef.current, data: { type: 'offer', sdp: offer.sdp } })
          }).catch(err => console.error('Error restarting ICE:', err))
        }
      } else if (pc.iceConnectionState === 'disconnected') {
        console.log('⚠️ ICE connection disconnected')
      }
    }
    
    return pc
  }

  const onNext = () => {
    if (!socket) return
    // reset previous peer connection for a clean renegotiate
    try { pcRef.current?.getSenders().forEach(s => { try { s.track?.stop() } catch (_) {} }) } catch (_) {}
    try { pcRef.current?.close() } catch (_) {}
    pcRef.current = null
    tracksAddedRef.current = false
    remoteStreamRef.current = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    setRemoteReady(false)
    setRemoteMuted(true)
    setConnectionState('new')
    setIsWaiting(true)
    setWaitingTime(0)
    clearInterval(waitingIntervalRef.current)
    waitingIntervalRef.current = setInterval(() => {
      setWaitingTime(prev => prev + 1)
    }, 1000)
    socket.emit('enqueue')
  }

  if (isWaiting) {
    return (
      <div className="vc-root">
        <header className="vc-header">
          <div className="vc-brand">Unimegle</div>
          <div className="vc-user-info">
            {currentUser && (
              <span className="vc-user-email">{currentUser.email}</span>
            )}
          </div>
          <div className="vc-actions">
            <button className="vc-btn danger" onClick={logout}>Logout</button>
          </div>
        </header>
        <WaitingScreen 
          activeUsers={activeUsers}
          waitingTime={waitingTime}
          localVideoRef={localVideoRef}
          onCancel={() => {
            setIsWaiting(false)
            clearInterval(waitingIntervalRef.current)
            if (socket) socket.emit('leave', { roomId: roomIdRef.current })
          }}
        />
      </div>
    )
  }

  return (
    <div className="vc-root">
      <header className="vc-header">
        <div className="vc-brand">Unimegle</div>
        <div className="vc-user-info">
          {currentUser && (
            <span className="vc-user-email">{currentUser.email}</span>
          )}
        </div>
        <div className="vc-actions">
          <button className="vc-btn secondary" onClick={() => { /* report placeholder */ }}>Report</button>
          <button className="vc-btn danger" onClick={logout}>Logout</button>
        </div>
      </header>
      <main className="vc-stage">
        <section className="vc-remote">
          <video 
            ref={remoteVideoRef} 
            className="vc-video remote" 
            autoPlay 
            playsInline 
            muted={remoteMuted}
            onLoadedMetadata={() => console.log('Remote video metadata loaded')}
            onPlay={() => console.log('Remote video started playing')}
            onError={(e) => console.error('Remote video error:', e)}
          />
          {!remoteReady && <div className="vc-placeholder">Waiting for a match... (State: {connectionState})</div>}
          {remoteReady && remoteMuted && (
            <div className="vc-controls" style={{ bottom: 20 }}>
              <button className="vc-btn primary" onClick={() => {
                setRemoteMuted(false)
                if (remoteVideoRef.current) remoteVideoRef.current.muted = false
              }}>Unmute</button>
            </div>
          )}
          {remoteReady && !remoteMuted && (
            <div className="vc-controls" style={{ bottom: 20 }}>
              <span style={{ color: 'green', fontSize: '12px' }}>Connected ({connectionState})</span>
            </div>
          )}
        </section>
        <aside className="vc-self">
          <video ref={localVideoRef} className="vc-video self" autoPlay playsInline muted />
          <div className="vc-controls">
            <button className="vc-btn" onClick={toggleMic}>{isMicOn ? 'Mute' : 'Unmute'}</button>
            <button className="vc-btn" onClick={toggleCamera}>{isCameraOn ? 'Camera Off' : 'Camera On'}</button>
            <button className="vc-btn primary" onClick={onNext}>Next</button>
          </div>
        </aside>
      </main>
    </div>
  )
}


