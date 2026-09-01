import type { PageServerLoad } from './$types';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  let stats = {
    freeRooms: 0,
    roomsInUse: 0,
    totalRevenue: 0,
    totalReservations: 0,
  };
  let recentActivity: any[] = [];
  let chartData: any[] = [];

  if (db && isDbHealthy) {
    try {
      // Free Rooms
      const roomsRes = await db.select({ totalFree: sql<number>`sum(${schema.rooms.availableRooms})` }).from(schema.rooms);
      stats.freeRooms = Number(roomsRes[0]?.totalFree || 0);

      // Rooms in Use (Active bookings today)
      // For simplicity, we just count confirmed bookings where checkInDate <= today and checkOutDate >= today
      const today = new Date().toISOString().split('T')[0];
      const activeBookings = await db.select({ count: sql<number>`count(*)` })
        .from(schema.bookings)
        .where(
          sql`${schema.bookings.status} = 'confirmed' AND ${schema.bookings.checkInDate} <= ${today} AND ${schema.bookings.checkOutDate} > ${today}`
        );
      stats.roomsInUse = Number(activeBookings[0]?.count || 0);

      // Total Revenue
      const revenueRes = await db.select({ total: sql<number>`sum(${schema.bookings.totalPrice})` })
        .from(schema.bookings)
        .where(eq(schema.bookings.status, 'confirmed'));
      stats.totalRevenue = Number(revenueRes[0]?.total || 0);

      // Total Reservations
      const totalRes = await db.select({ count: sql<number>`count(*)` }).from(schema.bookings);
      stats.totalReservations = Number(totalRes[0]?.count || 0);

      // Recent Activity
      recentActivity = await db.select()
        .from(schema.bookings)
        .orderBy(desc(schema.bookings.createdAt))
        .limit(6);

      // Chart Data (Bookings by month for the current year)
      // Since SQLite / PG might differ in date grouping syntax, we'll fetch all and group in JS for simplicity or use standard SQL if PG
      const allBookings = await db.select({
        createdAt: schema.bookings.createdAt,
        totalPrice: schema.bookings.totalPrice
      }).from(schema.bookings);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      
      const monthlyData = new Array(12).fill(0);
      allBookings.forEach(b => {
        const d = new Date(b.createdAt);
        if (d.getFullYear() === currentYear) {
          monthlyData[d.getMonth()] += Number(b.totalPrice);
        }
      });

      chartData = months.map((m, i) => ({
        month: m,
        revenue: monthlyData[i]
      }));

    } catch (e) {
      console.error('Error fetching admin dashboard stats:', e);
    }
  }

  return {
    stats,
    recentActivity,
    chartData
  };
};
