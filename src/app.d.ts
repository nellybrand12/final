import type { AdminUser } from '$lib/server/db/schema';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			adminUser?: AdminUser | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
