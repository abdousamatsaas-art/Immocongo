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
    const payload = body?.payload || body;

    if (!payload?.title || !payload?.type || !payload?.description || !payload?.area || !payload?.adresse || !payload?.price) {
      return respond(400, { message: 'Missing required fields' });
    }

    const store = getStore({
      name: STORE_NAME,
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN,
    });

    const raw = await store.get(ANN_KEY);
    const rows = readMaybe<any[]>(raw ? raw.toString() : null, []);

    const now = Date.now();
    const item = {
      id: String(payload.id || ('a_' + Math.random().toString(16).slice(2) + '_' + now)),
      createdAt: Number(payload.createdAt || now),
      titre: payload.title,
      type: payload.type,
      description: payload.description,
      quartier: payload.area,
      adresse: payload.adresse,
      prix: payload.price,
      statut: payload.status || 'Disponible',
      chambres: payload.chambres ?? 0,
      sallesDeBain: payload.sallesDeBain ?? 0,
      capacite: payload.capacite ?? 1,
      surface: payload.surface ?? 0,
      note: payload.note ?? 0,
      nombreAvis: payload.nombreAvis ?? 0,
      urgent: payload.urgent ? 1 : 0,
      equipements: payload.equipements || [],
      images: payload.images || [],
    };

    rows.push(item);
    await store.setJSON(ANN_KEY, rows as any);

    return respond(200, item);
  } catch (e: any) {
    return respond(500, { message: String(e?.message || e) });
  }
};




