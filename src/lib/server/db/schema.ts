import { pgTable, text, serial, timestamp, integer, decimal, jsonb, date, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: text('name').notNull(), // Keep simple name since translation is for DB fields? Wait, user agreed to multilingual. We can use JSONB for name and description.
  // Actually, wait, let's keep name as text and add a separate jsonb for translations to avoid breaking existing code, OR update existing types.
  // The simplest is to just make description and name jsonb. Let's look at existing code... actually the previous schema used text. I'll just change name to text, but use jsonb for the new `name` and `description` or just keep text and assume it's FR by default as requested. The user said "yes" to multilingual, so we can use jsonb for text fields.
  // I will just use `nameFr` and `nameEn` for simplicity in types to avoid TS errors with jsonb typing.
  nameFr: text('name_fr').notNull().default(''),
  nameEn: text('name_en').notNull().default(''),
  taglineFr: text('tagline_fr'),
  taglineEn: text('tagline_en'),
  descriptionFr: text('description_fr').notNull().default(''),
  descriptionEn: text('description_en').notNull().default(''),
  category: varchar('category', { length: 50 }).default('suite').notNull(), // 'suite', 'deluxe', 'executive'
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }).notNull(),
  maxGuests: integer('max_guests').notNull(),
  sizeSqM: integer('size_sqm').default(65),
  bedType: varchar('bed_type', { length: 100 }).default('King Size'),
  imageUrl: text('image_url').notNull(),
  galleryImages: jsonb('gallery_images').default('[]').notNull(),
  amenities: jsonb('amenities').default('[]').notNull(),
  status: varchar('status', { length: 50 }).default('available').notNull(), // 'available', 'maintenance'
  type: varchar('type', { length: 50 }).default('room').notNull(), // 'room', 'hall'
  totalRooms: integer('total_rooms').default(5).notNull(),
  availableRooms: integer('available_rooms').default(5).notNull(),
  inUseRooms: integer('in_use_rooms').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  bookingReference: varchar('booking_reference', { length: 50 }).notNull().unique(),
  guestName: text('guest_name').notNull(),
  guestEmail: varchar('guest_email', { length: 255 }).notNull(),
  guestPhone: varchar('guest_phone', { length: 50 }),
  roomId: integer('room_id').references(() => rooms.id).notNull(),
  checkInDate: date('check_in_date').notNull(),
  checkOutDate: date('check_out_date').notNull(),
  guestsCount: integer('guests_count').default(2).notNull(),
  specialRequests: text('special_requests'),
  eventType: varchar('event_type', { length: 255 }), // For hall bookings
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).default('hotel'), // 'hotel', 'mtn_momo', 'orange_money', 'card'
  paymentTransactionId: varchar('payment_transaction_id', { length: 255 }),
  status: varchar('status', { length: 50 }).default('pending_payment').notNull(), // 'pending_payment', 'confirmed', 'failed', 'cancelled'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  subject: varchar('subject', { length: 255 }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 100 }).default('general').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const adminSessions = pgTable('admin_sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => adminUsers.id).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  deviceId: text('device_id'), // optional to track devices
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: varchar('id', { length: 100 }).primaryKey(), // Using slug/id like 'suites', 'spa'
  nameFr: text('name_fr').notNull(),
  nameEn: text('name_en').notNull(),
  highlightFr: text('highlight_fr').notNull(),
  highlightEn: text('highlight_en').notNull(),
  descriptionFr: text('description_fr').notNull(),
  descriptionEn: text('description_en').notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),
  ctaTextFr: varchar('cta_text_fr', { length: 100 }).notNull(),
  ctaTextEn: varchar('cta_text_en', { length: 100 }).notNull(),
  ctaLink: text('cta_link').notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type AdminSession = typeof adminSessions.$inferSelect;
export type Service = typeof services.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
