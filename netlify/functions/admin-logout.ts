const COOKIE_NAME = 'immocongo_admin_auth';

export const handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    },
    body: JSON.stringify({ ok: true }),
  };
};



