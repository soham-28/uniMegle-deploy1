import jwt from 'jsonwebtoken'

export function extractToken(req) {
  const cookieToken = req.cookies?.token
  const header = req.headers.authorization || ''
  const headerToken = header.startsWith('Bearer ') ? header.slice(7) : null
  return cookieToken || headerToken || null
}

export function requireAuth(req, res, next) {
  const token = extractToken(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev')
    req.userId = payload.sub
    return next()
  } catch (_e) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

export function optionalAuth(req, _res, next) {
  const token = extractToken(req)
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev')
      req.userId = payload.sub
    } catch (_e) {
      // ignore
    }
  }
  return next()
}

export function verifySocketToken(token) {
  if (!token) return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev')
    return payload.sub
  } catch (_e) {
    return null
  }
}


