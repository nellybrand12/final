import { env } from "$env/dynamic/private";
import type { Booking, Room } from "$lib/server/db/schema";
import {
  generateBookingReceiptPdf,
  formatPriceFCFA,
  getPaymentMethodLabel,
} from "$lib/server/pdf/receiptGenerator";

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

export async function sendBookingConfirmationEmail(
  booking: Booking,
  room?: Room | null,
): Promise<EmailDispatchResult> {
  const apiKey = env.EMAIL_API_KEY || env.RESEND_API_KEY;
  const fromAddress =
    env.EMAIL_FROM_ADDRESS || "reservations@madadjeu-hotel.com";
  const hotelContact = "concierge@madadjeu-hotel.com";

  const isConfiguredApiKey = Boolean(
    apiKey &&
    apiKey.trim() !== "" &&
    !apiKey.includes("your_") &&
    !apiKey.includes("sample_") &&
    !apiKey.includes("PLACEHOLDER"),
  );

  // 1. Generate PDF receipt buffer
  let pdfBase64 = "";
  let pdfByteLength = 0;
  try {
    const pdfBytes = await generateBookingReceiptPdf({ booking, room });
    pdfByteLength = pdfBytes.byteLength;
    pdfBase64 = Buffer.from(pdfBytes).toString("base64");
  } catch (pdfErr) {
    console.warn(
      "[Email Service] Could not generate PDF attachment, sending email without attachment:",
      pdfErr,
    );
  }

  // 2. Calculate duration
  const start = new Date(booking.checkInDate);
  const end = new Date(booking.checkOutDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const roomsCount = booking.guestsCount || 1;
  const roomName = room?.name || "Appartement Supérieur";
  const paymentMethodStr = getPaymentMethodLabel(booking.paymentMethod);
  const totalFormatted = `${formatPriceFCFA(booking.totalPrice)} FCFA`;
  const attachmentFilename = `Recu-Reservation-Madadjeu-${booking.bookingReference}.pdf`;

  // 3. Build HTML Email Content
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de réservation - Hôtel Résidence Madadjeu</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f1; color: #1b1d1c; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7f6f1; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e0dfd5; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Gold Header Accent -->
          <tr>
            <td height="6" style="background-color: #c5a880; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Brand Header -->
          <tr>
            <td style="padding: 30px 35px 20px; text-align: center; border-bottom: 1px solid #f0efe8;">
              <h1 style="margin: 0 0 6px; font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #1b1d1c; text-transform: uppercase;">
                Hôtel Résidence Madadjeu
              </h1>
              <p style="margin: 0; font-size: 11px; color: #8c7653; text-transform: uppercase; letter-spacing: 1.5px;">
                Prestige & Raffinement Résidentiel • Yaoundé
              </p>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 25px 35px 15px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; color: #1b1d1c; font-weight: bold;">
                Votre réservation est confirmée
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; color: #4a4a4a;">
                Cher(e) <strong>${booking.guestName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #4a4a4a;">
                Nous avons le plaisir de vous confirmer votre séjour à l'Hôtel Résidence Madadjeu. Toute notre équipe se réjouit de vous accueillir pour une expérience de détente et de grand confort.
              </p>
            </td>
          </tr>

          <!-- Summary Box -->
          <tr>
            <td style="padding: 0 35px 25px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fcfbf8; border: 1px solid #e8e6dc; border-left: 4px solid #c5a880; border-radius: 3px; padding: 18px 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8c7653; font-weight: bold;">
                      Référence de réservation
                    </p>
                    <p style="margin: 0 0 16px; font-size: 20px; font-weight: bold; color: #1b1d1c; letter-spacing: 1px;">
                      ${booking.bookingReference}
                    </p>
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="6" border="0" style="font-size: 13px; color: #333333;">
                      <tr>
                        <td width="40%" style="color: #777777; padding-left: 0;">Hébergement :</td>
                        <td width="60%" style="font-weight: bold; padding-right: 0;">${roomName}</td>
                      </tr>
                      <tr>
                        <td style="color: #777777; padding-left: 0;">Date d'arrivée :</td>
                        <td style="font-weight: bold; padding-right: 0;">${booking.checkInDate} (dès 14h00)</td>
                      </tr>
                      <tr>
                        <td style="color: #777777; padding-left: 0;">Date de départ :</td>
                        <td style="font-weight: bold; padding-right: 0;">${booking.checkOutDate} (jusqu'à 12h00)</td>
                      </tr>
                      <tr>
                        <td style="color: #777777; padding-left: 0;">Durée du séjour :</td>
                        <td style="font-weight: bold; padding-right: 0;">${nights} nuit(s) • ${roomsCount} chambre(s)</td>
                      </tr>
                      <tr>
                        <td style="color: #777777; padding-left: 0;">Règlement :</td>
                        <td style="font-weight: bold; padding-right: 0;">${paymentMethodStr}</td>
                      </tr>
                      <tr style="border-top: 1px solid #e0dfd5;">
                        <td style="color: #1b1d1c; font-weight: bold; padding-left: 0; padding-top: 12px;">Total de la réservation :</td>
                        <td style="font-weight: bold; color: #8c7653; font-size: 16px; padding-right: 0; padding-top: 12px;">${totalFormatted}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PDF Attachment Notice -->
          <tr>
            <td style="padding: 0 35px 25px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="14" border="0" style="background-color: #f0f4f0; border: 1px solid #c9dcc9; border-radius: 4px;">
                <tr>
                  <td style="font-size: 13px; color: #1e4620;">
                    📄 <strong>Reçu officiel attaché :</strong> Votre facture acquittée et reçu de séjour complet est joint à cet email sous le nom <em>${attachmentFilename}</em>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Stay Information Notes -->
          <tr>
            <td style="padding: 0 35px 30px; font-size: 12px; color: #666666; line-height: 1.7;">
              <p style="margin: 0 0 8px;"><strong>Informations pratiques :</strong></p>
              <ul style="margin: 0; padding-left: 18px;">
                <li>Présentez ce message ou votre reçu PDF lors de votre enregistrement à la réception.</li>
                <li>Le service conciergerie et room service est joignable 24h/24 au +237 691 23 45 67.</li>
                <li>Pour toute demande de navette aéroportuaire ou aménagement spécial, contactez-nous à <a href="mailto:${hotelContact}" style="color: #8c7653;">${hotelContact}</a>.</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1b1d1c; padding: 25px 35px; text-align: center; color: #d6d5cf; font-size: 11px;">
              <p style="margin: 0 0 6px; font-weight: bold; letter-spacing: 1px; color: #c5a880;">
                HÔTEL RÉSIDENCE MADADJEU
              </p>
              <p style="margin: 0 0 10px; color: #999999;">
                Quartier Bastos, Yaoundé — République du Cameroun
              </p>
              <p style="margin: 0; color: #777777; font-size: 10px;">
                © ${new Date().getFullYear()} Hôtel Résidence Madadjeu. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // 4. Plain Text Alternative
  const textContent = `
HÔTEL RÉSIDENCE MADADJEU - CONFIRMATION DE RÉSERVATION

Cher(e) ${booking.guestName},

Votre réservation à l'Hôtel Résidence Madadjeu est confirmée.

RÉCAPITULATIF DE VOTRE SÉJOUR :
- Référence : ${booking.bookingReference}
- Hébergement : ${roomName}
- Date d'arrivée : ${booking.checkInDate} (dès 14h00)
- Date de départ : ${booking.checkOutDate} (jusqu'à 12h00)
- Durée : ${nights} nuit(s) (${roomsCount} chambre(s))
- Mode de règlement : ${paymentMethodStr}
- Montant total : ${totalFormatted} (Taxes & services inclus)

Votre reçu officiel de réservation est joint à cet email au format PDF (${attachmentFilename}).

Contact Conciergerie 24h/24 : +237 691 23 45 67 / ${hotelContact}
Adresse : Quartier Bastos, Yaoundé, Cameroun.

Nous vous souhaitons un agréable séjour parmi nous.
  `.trim();

  // 5. Dispatch via live provider API or Simulated Log
  if (isConfiguredApiKey && apiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Hôtel Résidence Madadjeu <${fromAddress}>`,
          to: [booking.guestEmail],
          subject: `Confirmation de votre réservation [${booking.bookingReference}] - Hôtel Résidence Madadjeu`,
          html: htmlContent,
          text: textContent,
          attachments: pdfBase64
            ? [
                {
                  filename: attachmentFilename,
                  content: pdfBase64,
                },
              ]
            : [],
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        console.warn(
          "[Email Service] Provider API responded with error:",
          responseData,
        );
        return {
          success: false,
          error: responseData.message || "Email API error",
        };
      }

      console.log(
        `[Email Service] Confirmation email sent successfully to ${booking.guestEmail} (ID: ${responseData.id})`,
      );
      return {
        success: true,
        messageId: responseData.id,
      };
    } catch (sendErr: any) {
      console.warn(
        "[Email Service] Failed to send email via provider API:",
        sendErr?.message || sendErr,
      );
      return {
        success: false,
        error: sendErr?.message || "Network error sending email",
      };
    }
  } else {
    // Graceful simulation mode: logs dispatch details cleanly
    console.log(
      `[Email Service] [SIMULATED] Automated confirmation email dispatched to ${booking.guestEmail} for reservation ${booking.bookingReference} with attached PDF receipt (${pdfByteLength} bytes).`,
    );
    return {
      success: true,
      simulated: true,
    };
  }
}
