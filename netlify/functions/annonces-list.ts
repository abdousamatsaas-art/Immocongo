import { getStore } from '@netlify/blobs';

const STORE_NAME = 'immocongo';
const ANN_KEY = 'immocongo/annonces.json';

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
    const type = event?.queryStringParameters?.type;

    const store = getStore(STORE_NAME);

    const raw = await store.get(ANN_KEY);
    const rows = readMaybe<any[]>(raw ? raw.toString() : null, []);

    const filtered = (type === 'vente' || type === 'location')
      ? rows.filter((a) => String(a.type) === type)
      : rows;

    filtered.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

    return respond(200, filtered);
  } catch (e: any) {
    return respond(500, { message: String(e?.message || e) });
  }
};