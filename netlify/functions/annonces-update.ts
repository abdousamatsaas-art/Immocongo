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

    const id = String(payload?.id || payload?.annId || '');
    if (!id) return respond(400, { message: 'Missing id' });

    const store = getStore(STORE_NAME);

    const raw = await store.get(ANN_KEY);
    const rows = readMaybe<any[]>(raw ? raw.toString() : null, []);

    const idx = rows.findIndex((x) => String(x.id) === id);
    if (idx < 0) return respond(404, { message: 'Not found' });

    const current = rows[idx];
    const updated = {
      ...current,
      titre: payload?.title ?? payload?.titre ?? current.titre,
      type: payload?.type ?? current.type,
      description: payload?.description ?? current.description,
      quartier: payload?.area ?? payload?.quartier ?? current.quartier,
      adresse: payload?.adresse ?? current.adresse,
      prix: payload?.price ?? payload?.prix ?? current.prix,
      statut: payload?.status ?? current.statut,
      chambres: payload?.chambres ?? current.chambres,
      sallesDeBain: payload?.sallesDeBain ?? current.sallesDeBain,
      capacite: payload?.capacite ?? current.capacite,
      surface: payload?.surface ?? current.surface,
      note: payload?.note ?? current.note,
      nombreAvis: payload?.nombreAvis ?? current.nombreAvis,
      urgent: payload?.urgent !== undefined ? (payload.urgent ? 1 : 0) : current.urgent,
      equipements: payload?.equipements ?? current.equipements,
      images: payload?.images ?? current.images,
    };

    rows[idx] = updated;
    await store.set(ANN_KEY, JSON.stringify(rows), { contentType: 'application/json' } as any);

    return respond(200, updated);
  } catch (e: any) {
    return respond(500, { message: String(e?.message || e) });
  }
};