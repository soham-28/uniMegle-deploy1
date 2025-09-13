import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ALLOWED_EMAIL_DOMAINS } from '../firebase';

export default function FirebaseAuth({ onAuthed }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signup(form.email, form.password);
        setMsg('Account created! Please check your email to verify your account before logging in.');
      } else {
        const userCredential = await login(form.email, form.password);
        if (userCredential.user.emailVerified) {
          onAuthed(userCredential.user);
        } else {
          setMsg('Please verify your email before logging in. Check your inbox for the verification link.');
        }
      }
    } catch (error) {
      setMsg(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-container">
        {/* Left side - Branding */}
        <div className="auth-branding">
          <div className="auth-logo">
            <div className="logo-icon">🎓</div>
            <h1>Unimegle</h1>
            <p>Connect with fellow students from your college</p>
          </div>
          <div className="auth-features">
            <div className="feature">
              <div className="feature-icon">🎥</div>
              <span>Video Chat</span>
            </div>
            <div className="feature">
              <div className="feature-icon">🔒</div>
              <span>Secure & Private</span>
            </div>
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <span>Smart Matching</span>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="auth-form-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2>{mode === 'login' ? 'Welcome Back!' : 'Join Unimegle'}</h2>
              <p>{mode === 'login' ? 'Sign in to connect with students' : 'Create your account to get started'}</p>
            </div>

            <div className="auth-tabs">
              <button 
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`} 
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button 
                className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} 
                onClick={() => setMode('signup')}
              >
                Sign Up
              </button>
            </div>
            
            <form onSubmit={submit} className="auth-form">
              {mode === 'signup' && (
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    placeholder="Enter your full name" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    required 
                  />
                </div>
              )}
              
              <div className="input-group">
                <label>College Email</label>
                <input 
                  placeholder="your.email@adypu.edu.in"
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  required 
                />
                <small>Use your official college email address</small>
              </div>
              
              <div className="input-group">
                <label>Password</label>
                <input 
                  placeholder="Create a strong password" 
                  type="password" 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  required 
                  minLength="6"
                />
                <small>Minimum 6 characters</small>
              </div>
              
              <button 
                className="auth-submit-btn" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  mode === 'signup' ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>
            
            {msg && (
              <div className={`auth-msg ${msg.includes('error') || msg.includes('not allowed') ? 'error' : 'success'}`}>
                <div className="msg-icon">
                  {msg.includes('error') || msg.includes('not allowed') ? '⚠️' : '✅'}
                </div>
                {msg}
              </div>
            )}
            
            <div className="auth-info">
              <div className="info-header">
                <span className="info-icon">🏫</span>
                <span>Supported Colleges</span>
              </div>
              <div className="college-list">
                {ALLOWED_EMAIL_DOMAINS.map(domain => (
                  <span key={domain} className="college-tag">{domain}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


