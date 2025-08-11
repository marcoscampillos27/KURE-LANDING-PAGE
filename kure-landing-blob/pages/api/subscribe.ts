import type { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';

export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, utm, referrer, ua } = req.body || {};
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
    return res.status(400).json({ error: 'Email no válido' });
  }

  const domain = String(email).split('@')[1]?.toLowerCase();
  const disposable = new Set(['mailinator.com','tempmail.com','10minutemail.com','guerrillamail.com','yopmail.com','sharklasers.com','trashmail.com','trashmail.de','getnada.com']);
  if (domain && disposable.has(domain)) return res.status(400).json({ error: 'No aceptamos correos temporales' });

  const now = new Date().toISOString();
  const key = `leads/${now.replace(/[:.]/g,'-')}-${Math.random().toString(36).slice(2,8)}.json`;

  const payload = {
    email: String(email).toLowerCase(),
    createdAt: now,
    referrer: referrer || null,
    ua: ua || null,
    utm: utm || null,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
  };

  await put(key, JSON.stringify(payload, null, 2), { contentType: 'application/json', access: 'private' });
  return res.status(200).json({ ok: true, downloadUrl: '/guia-kure.pdf' });
}
