/**
 * Locale-invariant data for the "Strategic Location" carousel.
 *
 * Photos, distances and travel times describe real places, so they are the
 * same whatever language the site is displayed in. They live here ONCE and are
 * merged with the per-locale text (name + description) from `i18n.svelte.ts`
 * at render time.
 *
 * Keeping them here is what prevents the two locales from drifting apart: the
 * English carousel previously carried its own copy of these fields, which had
 * fallen out of sync (a missing slide, duplicated and expiring image URLs, and
 * different distances for the same place).
 *
 * The order of this array is the order the slides appear in the carousel.
 */
export interface NeighborhoodPlace {
  /** Stable key, used to look up this place's translated text. */
  id: string;
  /** Shared across locales — these are photos of real places. */
  imageUrl: string;
  /** Distance from the residence, shown next to both travel times. */
  distance: string;
  driveTime: string;
  /** "N/A" where walking is not realistic; the UI hides the walk row then. */
  walkTime: string;
}

export const neighborhoodPlaces: NeighborhoodPlace[] = [
  {
    id: "garde",
    imageUrl:
      "https://mindef.gov.cm/wp-content/uploads/2025/05/Passe-et-Avenir-6.jpg",
    distance: "200 m",
    driveTime: "1 min",
    walkTime: "2 min",
  },
  {
    id: "zoo",
    imageUrl:
      "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-400x400/15/92/fd/fc.jpg",
    distance: "950 m",
    driveTime: "3 min",
    walkTime: "14 min",
  },
  {
    id: "palais",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Yaound%C3%A9_Sports_Palace_2014_%2802%29.JPG/3840px-Yaound%C3%A9_Sports_Palace_2014_%2802%29.JPG",
    distance: "4.2 km",
    driveTime: "8 min",
    walkTime: "35 min",
  },
  {
    id: "centre",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMUcwix3wbLQpUwzHRRtVmLuTqTzsA1nP5p5o09apKONbOmYvA9cApO0Z4&s=10",
    distance: "4.9 km",
    driveTime: "9 min",
    walkTime: "45 min",
  },
  {
    id: "bastos",
    imageUrl:
      "https://news.uniresa.com/wp-content/uploads/2026/04/Top-5-quartiers-confortables-a-Yaounde-scaled.jpg",
    distance: "6.8 km",
    driveTime: "15 min",
    walkTime: "55 min",
  },
  {
    id: "aeroport",
    imageUrl:
      "https://www.1flt.com/_next/image?url=%2Fphotos%2Fairport-aerial.jpg&w=3840&q=75",
    distance: "24 km",
    driveTime: "30 min",
    walkTime: "N/A",
  },
];
