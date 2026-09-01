import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { invalidateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get('admin_session');
  if (sessionId) {
    await invalidateSession(sessionId);
    cookies.delete('admin_session', { path: '/' });
  }
  
  throw redirect(303, '/admin/login');
};
