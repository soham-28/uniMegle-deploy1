const API_BASE = 'http://localhost:4000/api'

export async function signup(data) {
  const res = await fetch(`${API_BASE}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), credentials: 'include' })
  return res.json()
}

export async function verify(token) {
  const res = await fetch(`${API_BASE}/auth/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }), credentials: 'include' })
  return res.json()
}

export async function login(data) {
  const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), credentials: 'include' })
  return res.json()
}

export async function session() {
  const res = await fetch(`${API_BASE}/auth/session`, { credentials: 'include' })
  return res.json()
}

export async function report(payload) {
  const res = await fetch(`${API_BASE}/report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' })
  return res.json()
}


