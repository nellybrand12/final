import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { validateSession } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  // Allow the login page to load without a valid session
  if (url.pathname === '/admin/login') {
    return { user: null };
  }

  const sessionId = cookies.get('admin_session');
  if (!sessionId) {
    throw redirect(303, '/admin/login');
  }

  const user = await validateSession(sessionId);
  if (!user) {
    cookies.delete('admin_session', { path: '/' });
    throw redirect(303, '/admin/login');
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
};
