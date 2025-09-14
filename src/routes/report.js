import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth } from '../middleware/auth.js'
import { query } from '../lib/db.js'

const router = Router()

router.post('/', requireAuth, async (req, res) => {
  const { reportedId, reason } = req.body || {}
  if (!reportedId || !reason) return res.status(400).json({ error: 'Missing fields' })
  const id = uuidv4()
  await query(
    `INSERT INTO reports (id, reporter_id, reported_id, reason, created_at)
     VALUES (?,?,?,?,NOW())`,
    [id, req.userId, reportedId, reason]
  )
  return res.json({ ok: true })
})

export default router


