import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBookingByReferenceOnly, getRoomById } from '$lib/server/db';
import { generateBookingReceiptPdf } from '$lib/server/pdf/receiptGenerator';

export const GET: RequestHandler = async ({ params }) => {
  const identifier = params.id?.trim();

  if (!identifier) {
    throw error(400, 'Identifiant de réservation manquant.');
  }

  // Look up booking by reference code or ID
  let booking = await getBookingByReferenceOnly(identifier);

  if (!booking) {
    throw error(404, `Réservation '${identifier}' introuvable.`);
  }

  const room = await getRoomById(booking.roomId);

  try {
    const pdfBytes = await generateBookingReceiptPdf({ booking, room });

    return new Response(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Recu-Madadjeu-${booking.bookingReference}.pdf"`,
        'Content-Length': pdfBytes.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (err: any) {
    console.error('[PDF Receipt] Generation failed:', err);
    throw error(500, 'Impossible de générer le reçu PDF pour cette réservation.');
  }
};
