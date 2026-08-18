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

    // Normaliser la structure des annonces pour l'interface frontend
    const normalized = (rows || []).map((a: any) => ({
      id: a.id || a.id || (a._id || ''),
      title: a.title || a.titre || a.name || '',
      type: a.type || a.type || (a.statut ? (String(a.statut).toLowerCase().includes('vente') ? 'vente' : 'location') : 'vente'),
      area: a.area || a.quartier || a.quartier || '',
      price: a.price || a.prix || a.prix || '',
      description: a.description || a.description || a.desc || '',
      images: a.images || a.images || [],
      chambres: a.chambres ?? a.chambres ?? 0,
      sallesDeBain: a.sallesDeBain ?? a.sallesDeBain ?? (a.sdb ?? 0),
      capacite: a.capacite ?? a.capacite ?? (a.capacity ?? 0),
      surface: a.surface ?? a.surface ?? (a.m2 ?? 0),
      status: a.status || a.statut || 'Disponible',
      createdAt: a.createdAt || a.createdAt || 0,
      // Garde les champs originaux au besoin
      __raw: a,
    }));

    const filtered = (type === 'vente' || type === 'location')
      ? normalized.filter((a) => String(a.type) === type)
      : normalized;

    filtered.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

    return respond(200, filtered);
  } catch (e: any) {
    return respond(500, { message: String(e?.message || e) });
  }
};