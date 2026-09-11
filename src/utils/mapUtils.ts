/**
 * Map utilities for converting Google Maps URLs or venue addresses
 * into embeddable map iframe URLs with pinned locations.
 */

export function getGoogleMapEmbedUrl(mapUrl?: string, fallbackQuery?: string): string | null {
  if (mapUrl && mapUrl.trim()) {
    const trimmed = mapUrl.trim();
    if (trimmed.includes("google.com/maps/embed")) {
      return trimmed;
    }
    try {
      const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const q = urlObj.searchParams.get("q") || urlObj.searchParams.get("query");
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
      const placeMatch = trimmed.match(/\/place\/([^/@?]+)/);
      if (placeMatch && placeMatch[1]) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1].replace(/\+/g, " ")))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
      const coordMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    } catch {
      // Ignore URL parse error
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  if (fallbackQuery && fallbackQuery.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  return null;
}
