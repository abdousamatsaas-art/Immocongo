import { getStore } from '@netlify/blobs';

const STORE_NAME = 'immocongo';
const ANN_KEY = 'immocongo/annonces.json';

const ADMIN_COOKIE = 'immocongo_admin_auth';

function readMaybe<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getCookieValue(event: any, name: string) {
  const cookieHeader = event?.headers?.cookie || event?.headers?.Cookie;
  if (!cookieHeader) return '';
  const parts = String(cookieHeader).split(';').map((s: string) => s.trim());
  for (const part of parts) {
    const [k, ...rest] = part.split('=');
    if (k === name) return rest.join('=');
  }
  return '';
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
  const cookieOk = getCookieValue(event, ADMIN_COOKIE) === '1';
  if (!cookieOk) return respond(401, { message: 'Unauthorized' });

  try {
    const body = event?.body ? JSON.parse(event.body) : {};
    const id = String(body?.id || body?.annId || '');
    if (!id) return respond(400, { message: 'Missing id' });

    const store = getStore(STORE_NAME);

    const raw = await store.get(ANN_KEY);
    const rows = readMaybe<any[]>(raw ? raw.toString() : []);

    const next = rows.filter((x) => String(x.id) !== id);
    await store.setJSON(ANN_KEY, next as any);

    return respond(200, { ok: true });
  } catch (e: any) {
    return respond(500, { message: String(e?.message || e) });
  }
};