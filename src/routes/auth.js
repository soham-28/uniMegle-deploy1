import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { query } from '../lib/db.js';

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

// Allowed email domains - add more domains here as needed
const ALLOWED_EMAIL_DOMAINS = [
  '@adypu.edu.in',
  '@scmspune.ac.in'
];

function isAllowedEmail(email) {
  return ALLOWED_EMAIL_DOMAINS.some(domain => 
    email.toLowerCase().endsWith(domain.toLowerCase())
  );
}

router.post('/signup', async (req, res) => {
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });
  const { email, password, name } = parse.data;

  if (!isAllowedEmail(email)) {
    return res.status(400).json({ error: 'Email domain not allowed. Please use an authorized educational institution email.' });
  }

  const existing = await query('SELECT id FROM users WHERE email=?', [email]);
  if (existing.rowCount) return res.status(409).json({ error: 'Email in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4();
  const userId = uuidv4();
  await query(
    `INSERT INTO users (id, email, name, password_hash, verified, created_at)
     VALUES (?,?,?,?,0, NOW())`,
    [userId, email, name, passwordHash]
  );
  await query(
    `INSERT INTO email_verifications (user_id, token, created_at)
     VALUES (?,?,NOW())`,
    [userId, verificationToken]
  );

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const verifyUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/verify?token=${verificationToken}`;
    await transporter.sendMail({
      from: 'Unimegle <no-reply@unimegle.com>',
      to: email,
      subject: 'Verify your Unimegle account',
      text: `Hi ${name}, verify your account: ${verifyUrl}`,
    });
  } catch (e) {
    // Ignore email errors in dev; keep record to re-send later
  }

  return res.json({ ok: true });
});

router.post('/verify', async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Token required' });
  const { rows } = await query(
    `SELECT user_id FROM email_verifications WHERE token=?`,
    [token]
  );
  if (!rows.length) return res.status(400).json({ error: 'Invalid token' });
  const userId = rows[0].user_id;
  await query('UPDATE users SET verified=1 WHERE id=?', [userId]);
  await query('DELETE FROM email_verifications WHERE token=?', [token]);
  return res.json({ ok: true });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing' });
  const { rows } = await query(
    'SELECT id, password_hash, verified FROM users WHERE email=?',
    [email]
  );
  if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  if (!user.verified) return res.status(403).json({ error: 'Verify email first' });

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev', {
    expiresIn: '7d',
  });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 3600 * 1000,
  });
  return res.json({ ok: true, token });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  return res.json({ ok: true });
});

router.get('/session', (req, res) => {
  const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.json({ authenticated: false });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    return res.json({ authenticated: true, userId: payload.sub });
  } catch (_e) {
    return res.json({ authenticated: false });
  }
});

export default router;


