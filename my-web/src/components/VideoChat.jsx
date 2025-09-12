import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export default function VideoChat() {
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
  const remoteStreamRef = useRef(null)

  useEffect(() => {
    let currentStream
    const start = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setStream(currentStream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = currentStream
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Media error', e)
      }
    }
    start()
    const s = io('http://localhost:4000', { withCredentials: true })
    setSocket(s)
    s.on('matched', async ({ roomId, role }) => {
      roomIdRef.current = roomId
      roleRef.current = role
      await ensurePeer()
      if (role === 'caller') {
        const offer = await pcRef.current.createOffer()
        await pcRef.current.setLocalDescription(offer)
        s.emit('signal', { roomId, data: { type: 'offer', sdp: offer.sdp } })
      }
    })
    s.on('signal', async ({ data }) => {
      await ensurePeer()
      if (data.type === 'offer') {
        await pcRef.current.setRemoteDescription({ type: 'offer', sdp: data.sdp })
        const answer = await pcRef.current.createAnswer()
        await pcRef.current.setLocalDescription(answer)
        s.emit('signal', { roomId: roomIdRef.current, data: { type: 'answer', sdp: answer.sdp } })
      } else if (data.type === 'answer') {
        await pcRef.current.setRemoteDescription({ type: 'answer', sdp: data.sdp })
      } else if (data.type === 'candidate') {
        try {
          await pcRef.current.addIceCandidate(data.candidate)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('ICE add error', e)
        }
      }
    })

    return () => {
      currentStream?.getTracks().forEach(t => t.stop())
      if (pcRef.current) pcRef.current.close()
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
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    pcRef.current = pc
    // Prepare to receive even if local tracks not ready
    try {
      pc.addTransceiver('video', { direction: 'sendrecv' })
      pc.addTransceiver('audio', { direction: 'sendrecv' })
    } catch (_e) { /* not all browsers require this */ }
    // Local tracks to peer
    if (stream && !tracksAddedRef.current) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream))
      tracksAddedRef.current = true
    }
    pc.onicecandidate = (event) => {
      if (event.candidate && roomIdRef.current && socket) {
        socket.emit('signal', { roomId: roomIdRef.current, data: { type: 'candidate', candidate: event.candidate } })
      }
    }
    pc.ontrack = (event) => {
      // Aggregate tracks into one MediaStream for the video element
      if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream()
      if (event.track && !remoteStreamRef.current.getTracks().includes(event.track)) {
        remoteStreamRef.current.addTrack(event.track)
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current
        setRemoteReady(true)
      }
    }
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setRemoteReady(false)
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
    socket.emit('enqueue')
  }

  return (
    <div className="vc-root">
      <header className="vc-header">
        <div className="vc-brand">Unimegle</div>
        <div className="vc-actions">
          <button className="vc-btn secondary" onClick={() => { /* report placeholder */ }}>Report</button>
          <button className="vc-btn danger" onClick={() => { /* end placeholder */ }}>End</button>
        </div>
      </header>
      <main className="vc-stage">
        <section className="vc-remote">
          <video ref={remoteVideoRef} className="vc-video remote" autoPlay playsInline muted={remoteMuted} />
          {!remoteReady && <div className="vc-placeholder">Waiting for a match...</div>}
          {remoteReady && remoteMuted && (
            <div className="vc-controls" style={{ bottom: 20 }}>
              <button className="vc-btn primary" onClick={() => {
                setRemoteMuted(false)
                if (remoteVideoRef.current) remoteVideoRef.current.muted = false
              }}>Unmute</button>
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


