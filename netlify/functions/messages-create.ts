import { getStore } from '@netlify/blobs';

const STORE_NAME = 'immocongo';
const MSG_KEY = 'immocongo/messages.json';

function readMaybe<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function respond(statusCode: number, bodyObj: any, extraHeaders?: Record<string, string>) {
  const headers: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
    ...(extraHeaders || {}),
  };
  return {
    statusCode,
    headers,
    body: JSON.stringify(bodyObj),
  };
}

export const handler = async (event: any) => {
  try {
    const body = event?.body ? JSON.parse(event.body) : {};

    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const phone = String(body?.phone || '').trim();
    const message = String(body?.message || '').trim();
    const quartier = String(body?.area || body?.quartier || '').trim();

    if (!name || !email || !phone || !message) {
      return respond(400, { message: 'Missing required fields' });
    }

    const store = getStore(STORE_NAME);

    const raw = await store.get(MSG_KEY);
    const rows = readMaybe<any[]>(raw ? raw.toString() : null, []);

    const item = {
      id: String(body?.id || ('m_' + Math.random().toString(16).slice(2) + '_' + Date.now())),
      createdAt: Date.now(),
      name,
      email,
      phone,
      message,
      quartier: quartier || '',
      area: quartier || '',
    };

    rows.push(item);
    await store.setJSON(MSG_KEY, rows as any);

    return respond(200, { ok: true, item });
  } catch (e: any) {
    return respond(500, { message: String(e?.message || e) });
  }
};