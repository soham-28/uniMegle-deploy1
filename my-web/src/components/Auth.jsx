import { useState } from 'react'
import { signup, login, verify } from '../api'

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [verifyToken, setVerifyToken] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      if (mode === 'signup') {
        const r = await signup(form)
        setMsg(r.ok ? 'Check your email for verification link.' : r.error || 'Error')
      } else if (mode === 'verify') {
        const r = await verify(verifyToken)
        setMsg(r.ok ? 'Verified! You can now login.' : r.error || 'Error')
      } else {
        const r = await login(form)
        if (r.ok) onAuthed(r.token)
        else setMsg(r.error || 'Login failed')
      }
    } catch (e) {
      setMsg('Network error')
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-tabs">
          <button className={mode==='login'?'active':''} onClick={() => setMode('login')}>Login</button>
          <button className={mode==='signup'?'active':''} onClick={() => setMode('signup')}>Signup</button>
          <button className={mode==='verify'?'active':''} onClick={() => setMode('verify')}>Verify</button>
        </div>
        <form onSubmit={submit}>
          {mode !== 'verify' && (
            <>
              {mode==='signup' && (
                <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
              )}
              <input placeholder="College Email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
              <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
            </>
          )}
          {mode==='verify' && (
            <input placeholder="Verification token" value={verifyToken} onChange={e=>setVerifyToken(e.target.value)} required />
          )}
          <button className="vc-btn primary" type="submit">{mode==='signup'?'Create account':mode==='verify'?'Verify':'Login'}</button>
        </form>
        {msg && <div className="auth-msg">{msg}</div>}
      </div>
    </div>
  )
}


