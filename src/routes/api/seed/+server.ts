import { json } from '@sveltejs/kit';
import { seedDatabase } from '$lib/server/db/seed';

export async function GET() {
  try {
    await seedDatabase();
    return json({ success: true, message: 'Database seeded' });
  } catch (err: any) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
}
