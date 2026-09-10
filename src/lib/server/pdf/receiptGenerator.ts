import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { Booking, Room } from "$lib/server/db/schema";

export interface ReceiptData {
  booking: Booking;
  room?: Room | null;
}

export function formatPriceFCFA(
  amount: string | number | undefined | null,
): string {
  if (!amount) return "0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("fr-FR")
    .format(num)
    .replace(/[\u202F\u00A0\u2007\u200B]/g, " ");
}

export function cleanPdfText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/[\u2018\u2019]/g, "'") // single curly quotes
    .replace(/[\u201C\u201D]/g, '"') // double curly quotes
    .replace(/[\u2013\u2014]/g, "-") // en-dash, em-dash
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, "-") // bullets
    .replace(/[\u2026]/g, "...") // ellipsis
    .replace(/[\u00A0\u202F\u2007\u2008\u2009\u200A\u200B]/g, " ") // all unicode space variants
    .replace(/•/g, "-");
}

export function getPaymentMethodLabel(
  method: string | null | undefined,
): string {
  switch (method) {
    case "hotel":
      return "Paiement sur place a l'arrivee (Hotel)";
    case "cinetpay":
      return "CinetPay (Mobile Money / Carte Bancaire)";
    case "mtn_momo":
      return "MTN Mobile Money Cameroun";
    case "orange_money":
      return "Orange Money Cameroun";
    case "card":
      return "Carte Bancaire (Visa / Mastercard)";
    default:
      return "Paiement garanti";
  }
}

export async function generateBookingReceiptPdf(
  data: ReceiptData,
): Promise<Uint8Array> {
  const { booking, room } = data;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Recu de Reservation - ${booking.bookingReference}`);
  pdfDoc.setAuthor("Hotel Residence Madadjeu");
  pdfDoc.setSubject("Recu officiel de reservation");
  pdfDoc.setCreationDate(new Date());

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Palette
  const colorCharcoal = rgb(0.11, 0.12, 0.12);
  const colorGold = rgb(0.77, 0.66, 0.5);
  const colorGoldDark = rgb(0.55, 0.44, 0.28);
  const colorLightBg = rgb(0.97, 0.96, 0.94);
  const colorMuted = rgb(0.45, 0.45, 0.45);
  const colorBorder = rgb(0.85, 0.85, 0.82);
  const colorWhite = rgb(1, 1, 1);
  const colorGreen = rgb(0.12, 0.55, 0.35);

  let y = height;

  // 1. TOP GOLD BAR
  page.drawRectangle({
    x: 0,
    y: y - 8,
    width,
    height: 8,
    color: colorGold,
  });
  y -= 40;

  // 2. HEADER SECTION
  page.drawText(cleanPdfText("HOTEL RESIDENCE MADADJEU"), {
    x: 45,
    y,
    size: 18,
    font: fontBold,
    color: colorCharcoal,
  });

  const receiptDateStr = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  page.drawText(cleanPdfText(`Emis le : ${receiptDateStr}`), {
    x: width - 180,
    y: y + 2,
    size: 9,
    font: fontRegular,
    color: colorMuted,
  });

  y -= 14;
  page.drawText(
    cleanPdfText("Prestige & Raffinement Residentiel - Yaounde, Cameroun"),
    {
      x: 45,
      y,
      size: 9,
      font: fontRegular,
      color: colorGoldDark,
    },
  );

  y -= 12;
  page.drawText(
    cleanPdfText(
      "Quartier Bastos - Tel : +237 691 23 45 67 - reservations@madadjeu-hotel.com",
    ),
    {
      x: 45,
      y,
      size: 8,
      font: fontRegular,
      color: colorMuted,
    },
  );

  // Divider
  y -= 18;
  page.drawLine({
    start: { x: 45, y },
    end: { x: width - 45, y },
    thickness: 1,
    color: colorBorder,
  });

  // 3. TITLE & STATUS BANNER
  y -= 38;
  page.drawRectangle({
    x: 45,
    y,
    width: width - 90,
    height: 32,
    color: colorLightBg,
    borderColor: colorGold,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: 45,
    y,
    width: 4,
    height: 32,
    color: colorGold,
  });

  page.drawText(cleanPdfText("RECU DE CONFIRMATION DE RESERVATION"), {
    x: 60,
    y: y + 11,
    size: 11,
    font: fontBold,
    color: colorCharcoal,
  });

  const statusText =
    booking.status === "confirmed"
      ? "STATUT : CONFIRME"
      : "STATUT : EN ATTENTE";
  page.drawText(cleanPdfText(statusText), {
    x: width - 180,
    y: y + 11,
    size: 9,
    font: fontBold,
    color: booking.status === "confirmed" ? colorGreen : colorGoldDark,
  });

  // 4. TWO-COLUMN SUMMARY BOXES
  y -= 25;
  const boxWidth = (width - 90 - 15) / 2;
  const boxHeight = 115;
  const boxY = y - boxHeight;

  // Box 1: Client Information
  page.drawRectangle({
    x: 45,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: colorWhite,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: 45,
    y: boxY + boxHeight - 22,
    width: boxWidth,
    height: 22,
    color: colorLightBg,
  });

  page.drawText(cleanPdfText("CLIENT & RESERVATION"), {
    x: 55,
    y: boxY + boxHeight - 15,
    size: 9,
    font: fontBold,
    color: colorCharcoal,
  });

  let clientY = boxY + boxHeight - 38;
  page.drawText(cleanPdfText("Ref. Reservation :"), {
    x: 55,
    y: clientY,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });
  page.drawText(cleanPdfText(booking.bookingReference), {
    x: 135,
    y: clientY,
    size: 8,
    font: fontBold,
    color: colorCharcoal,
  });

  clientY -= 16;
  page.drawText(cleanPdfText("Nom du client :"), {
    x: 55,
    y: clientY,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });
  page.drawText(cleanPdfText(booking.guestName), {
    x: 135,
    y: clientY,
    size: 8,
    font: fontBold,
    color: colorCharcoal,
  });

  clientY -= 16;
  page.drawText(cleanPdfText("Email :"), {
    x: 55,
    y: clientY,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });
  page.drawText(cleanPdfText(booking.guestEmail), {
    x: 135,
    y: clientY,
    size: 8,
    font: fontRegular,
    color: colorCharcoal,
  });

  clientY -= 16;
  page.drawText(cleanPdfText("Telephone :"), {
    x: 55,
    y: clientY,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });
  page.drawText(cleanPdfText(booking.guestPhone || "Non renseigne"), {
    x: 135,
    y: clientY,
    size: 8,
    font: fontRegular,
    color: colorCharcoal,
  });

  // Box 2: Stay Information
  const rightBoxX = 45 + boxWidth + 15;
  page.drawRectangle({
    x: rightBoxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: colorWhite,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: rightBoxX,
    y: boxY + boxHeight - 22,
    width: boxWidth,
    height: 22,
    color: colorLightBg,
  });

  page.drawText(cleanPdfText("DETAILS DU SEJOUR"), {
    x: rightBoxX + 10,
    y: boxY + boxHeight - 15,
    size: 9,
    font: fontBold,
    color: colorCharcoal,
  });

  // Calculate nights
  const start = new Date(booking.checkInDate);
  const end = new Date(booking.checkOutDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const roomsCount = booking.guestsCount || 1;

  let stayY = boxY + boxHeight - 38;
  const isHall = room?.type === "hall";
  page.drawText(cleanPdfText(isHall ? "Salle / Espace :" : "Hebergement :"), {
    x: rightBoxX + 10,
    y: stayY,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });
  page.drawText(
    cleanPdfText(
      room?.name || (isHall ? "Salle de Reception" : "Appartement Superieur"),
    ),
    {
      x: rightBoxX + 85,
      y: stayY,
      size: 8,
      font: fontBold,
      color: colorCharcoal,
    },
  );

  stayY -= 16;
  page.drawText(cleanPdfText(isHall ? "Debut evenement :" : "Arrivee :"), {
    x: rightBoxX + 10,
    y: stayY,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });
  page.drawText(
    cleanPdfText(
      `${booking.checkInDate} ${isHall ? "(des 08h00)" : "(des 14h00)"}`,
    ),
    {
      x: rightBoxX + 85,
      y: stayY,
      size: 8,
      font: fontRegular,
      color: colorCharcoal,
    },
  );

  stayY -= 16;
  page.drawText(cleanPdfText(isHall ? "Fin evenement :" : "Depart :"), {
    x: rightBoxX + 10,
    y: stayY,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });
  page.drawText(
    cleanPdfText(
      `${booking.checkOutDate} ${isHall ? "(jusqu'a 23h00)" : "(jusqu'a 12h00)"}`,
    ),
    {
      x: rightBoxX + 85,
      y: stayY,
      size: 8,
      font: fontRegular,
      color: colorCharcoal,
    },
  );

  stayY -= 16;
  page.drawText(cleanPdfText("Duree & Qte :"), {
    x: rightBoxX + 10,
    y: stayY,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });
  const durationText = isHall
    ? `${nights} jour(s) - 1 salle`
    : `${nights} nuit(s) - ${roomsCount} chambre(s)`;
  page.drawText(cleanPdfText(durationText), {
    x: rightBoxX + 85,
    y: stayY,
    size: 8,
    font: fontBold,
    color: colorCharcoal,
  });

  y = boxY - 25;

  // 5. PRICING BREAKDOWN TABLE
  const tableX = 45;
  const tableWidth = width - 90;
  const rowHeight = 24;

  // Table Header
  page.drawRectangle({
    x: tableX,
    y: y - rowHeight,
    width: tableWidth,
    height: rowHeight,
    color: colorCharcoal,
  });

  page.drawText(cleanPdfText("DESIGNATION DES PRESTATIONS"), {
    x: tableX + 12,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });
  page.drawText(cleanPdfText("QTE"), {
    x: tableX + 270,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });
  page.drawText(cleanPdfText("PRIX UNITAIRE"), {
    x: tableX + 325,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });
  page.drawText(cleanPdfText("TOTAL (FCFA)"), {
    x: tableX + 430,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });

  y -= rowHeight;

  // Row 1: Room rate
  page.drawRectangle({
    x: tableX,
    y: y - rowHeight,
    width: tableWidth,
    height: rowHeight,
    color: colorWhite,
    borderColor: colorBorder,
    borderWidth: 0.5,
  });

  const unitRate = room?.pricePerNight
    ? parseFloat(room.pricePerNight)
    : parseFloat(booking.totalPrice) / (nights * roomsCount);
  page.drawText(
    cleanPdfText(
      `${room?.name || "Hebergement"} - ${nights} nuit(s) x ${roomsCount} ch.`,
    ),
    {
      x: tableX + 12,
      y: y - 16,
      size: 8,
      font: fontRegular,
      color: colorCharcoal,
    },
  );
  page.drawText(cleanPdfText(`${nights * roomsCount}`), {
    x: tableX + 275,
    y: y - 16,
    size: 8,
    font: fontRegular,
    color: colorCharcoal,
  });
  page.drawText(cleanPdfText(`${formatPriceFCFA(unitRate)} FCFA`), {
    x: tableX + 325,
    y: y - 16,
    size: 8,
    font: fontRegular,
    color: colorCharcoal,
  });
  page.drawText(cleanPdfText(`${formatPriceFCFA(booking.totalPrice)} FCFA`), {
    x: tableX + 430,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: colorCharcoal,
  });

  y -= rowHeight;

  // Row 2: Taxes and Services
  page.drawRectangle({
    x: tableX,
    y: y - rowHeight,
    width: tableWidth,
    height: rowHeight,
    color: colorLightBg,
    borderColor: colorBorder,
    borderWidth: 0.5,
  });

  page.drawText(
    cleanPdfText(
      "Taxes de sejour, TVA (19.25%) et Services conciergerie inclus",
    ),
    {
      x: tableX + 12,
      y: y - 16,
      size: 8,
      font: fontItalic,
      color: colorMuted,
    },
  );
  page.drawText("1", {
    x: tableX + 275,
    y: y - 16,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });
  page.drawText("Inclus", {
    x: tableX + 325,
    y: y - 16,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });
  page.drawText("0 FCFA", {
    x: tableX + 430,
    y: y - 16,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });

  y -= rowHeight;

  // Total Summary Row
  page.drawRectangle({
    x: tableX,
    y: y - 28,
    width: tableWidth,
    height: 28,
    color: colorLightBg,
    borderColor: colorGold,
    borderWidth: 1.5,
  });

  page.drawText(cleanPdfText("TOTAL NET A PAYER / REGLE :"), {
    x: tableX + 12,
    y: y - 18,
    size: 9,
    font: fontBold,
    color: colorCharcoal,
  });

  page.drawText(cleanPdfText(`${formatPriceFCFA(booking.totalPrice)} FCFA`), {
    x: tableX + 410,
    y: y - 18,
    size: 11,
    font: fontBold,
    color: colorGoldDark,
  });

  y -= 45;

  // 6. PAYMENT DETAILS BOX
  page.drawRectangle({
    x: 45,
    y: y - 48,
    width: width - 90,
    height: 48,
    color: colorWhite,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  page.drawText(cleanPdfText("MODE DE REGLEMENT :"), {
    x: 58,
    y: y - 18,
    size: 8,
    font: fontBold,
    color: colorCharcoal,
  });

  page.drawText(cleanPdfText(getPaymentMethodLabel(booking.paymentMethod)), {
    x: 180,
    y: y - 18,
    size: 8,
    font: fontRegular,
    color: colorCharcoal,
  });

  if (booking.paymentTransactionId) {
    page.drawText(cleanPdfText("REFERENCE TRANSACTION :"), {
      x: 58,
      y: y - 34,
      size: 8,
      font: fontBold,
      color: colorCharcoal,
    });

    page.drawText(cleanPdfText(booking.paymentTransactionId), {
      x: 180,
      y: y - 34,
      size: 8,
      font: fontRegular,
      color: colorCharcoal,
    });
  } else {
    page.drawText(cleanPdfText("CONDITIONS DE PAIEMENT :"), {
      x: 58,
      y: y - 34,
      size: 8,
      font: fontBold,
      color: colorCharcoal,
    });

    page.drawText(
      cleanPdfText(
        "Reglement complet a la reception lors du check-in en especes ou carte.",
      ),
      {
        x: 180,
        y: y - 34,
        size: 8,
        font: fontItalic,
        color: colorMuted,
      },
    );
  }

  y -= 70;

  // 7. POLICIES & IMPORTANT NOTES
  page.drawText(
    cleanPdfText("INFORMATIONS IMPORTANTES & CONDITIONS DU SEJOUR"),
    {
      x: 45,
      y,
      size: 8.5,
      font: fontBold,
      color: colorCharcoal,
    },
  );

  y -= 14;
  page.drawText(
    cleanPdfText(
      "- Heure d'arrivee (Check-in) : a partir de 14h00. Heure de depart (Check-out) : jusqu'a 12h00.",
    ),
    {
      x: 45,
      y,
      size: 7.5,
      font: fontRegular,
      color: colorMuted,
    },
  );

  y -= 11;
  const cancellationPolicyPdfText =
    room?.type === "hall"
      ? "- Annulation & Modification : Remboursement de 95% garanti pour toute annulation effectuee au moins 36 heures avant l'evenement."
      : "- Annulation & Modification : Remboursement de 95% garanti pour toute annulation effectuee au moins 20 heures avant le check-in.";
  page.drawText(cleanPdfText(cancellationPolicyPdfText), {
    x: 45,
    y,
    size: 7.5,
    font: fontRegular,
    color: colorMuted,
  });

  y -= 11;
  page.drawText(
    cleanPdfText(
      "- Piece d'identite requise : Veuillez presenter une piece d'identite valide et ce recu lors du check-in.",
    ),
    {
      x: 45,
      y,
      size: 7.5,
      font: fontRegular,
      color: colorMuted,
    },
  );

  y -= 11;
  page.drawText(
    cleanPdfText(
      "- Service Conciergerie & Navette aeroport : Disponible 24h/24 sur simple demande aupres de la reception.",
    ),
    {
      x: 45,
      y,
      size: 7.5,
      font: fontRegular,
      color: colorMuted,
    },
  );

  // 8. FOOTER WITH GOLD SIGNATURE LINE
  y -= 35;
  page.drawLine({
    start: { x: 45, y },
    end: { x: width - 45, y },
    thickness: 1,
    color: colorGold,
  });

  y -= 16;
  page.drawText(
    cleanPdfText(
      "Nous vous remercions de votre confiance et vous souhaitons un sejour inoubliable a l'Hotel Residence Madadjeu.",
    ),
    {
      x: 45,
      y,
      size: 8,
      font: fontItalic,
      color: colorCharcoal,
    },
  );

  y -= 12;
  page.drawText(
    cleanPdfText(
      "Document genere electroniquement par le systeme de reservation Madadjeu - Fait foi de confirmation officielle.",
    ),
    {
      x: 45,
      y,
      size: 7,
      font: fontRegular,
      color: colorMuted,
    },
  );

  return await pdfDoc.save();
}
