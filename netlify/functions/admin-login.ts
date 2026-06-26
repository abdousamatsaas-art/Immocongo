const ADMIN_SECRET_ENV = 'IMMOCONGO_ADMIN_SECRET';
const COOKIE_NAME = 'immocongo_admin_auth';

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
    if (event?.httpMethod && String(event.httpMethod).toUpperCase() !== 'POST') {
      return respond(405, { message: 'Method Not Allowed' });
    }

    const secret = process.env[ADMIN_SECRET_ENV];
    const body = event?.body ? JSON.parse(event.body) : {};
    const password = body?.password;

    if (!secret || password !== secret) {
      return respond(401, { message: 'Unauthorized' });
    }

    return respond(
      200,
      { ok: true },
      {
        'set-cookie': `${COOKIE_NAME}=1; Path=/admin; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
      }
    );
  } catch (e: any) {
    return respond(500, { message: String(e?.message || e) });
  }
};


