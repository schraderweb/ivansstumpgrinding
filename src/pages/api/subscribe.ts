import { createClient } from '@libsql/client';

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const url = import.meta.env.TURSO_DATABASE_URL;
  const token = import.meta.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let email = '';
  try {
    const body = await request.json();
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Please enter a valid email address' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const client = createClient({ url, authToken: token });
    await client.execute({
      sql: 'INSERT OR IGNORE INTO subscribers (email) VALUES (?)',
      args: [email],
    });
    await client.close();
  } catch {
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true, message: "You're on the list. We'll be in touch soon." }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
