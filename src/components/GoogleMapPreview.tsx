import React from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { getGoogleMapEmbedUrl } from "../utils/mapUtils";

interface GoogleMapPreviewProps {
  mapUrl?: string;
  address?: string;
  pincode?: string;
  groundName?: string;
  location?: string;
  state?: string;
  height?: string;
}

export const GoogleMapPreview: React.FC<GoogleMapPreviewProps> = ({
  mapUrl,
  address,
  pincode,
  groundName,
  location,
  state,
  height = "240px",
}) => {
  const queryFallback = [groundName, address, location, pincode, state, "India"]
    .filter(Boolean)
    .join(", ");

  const embedUrl = getGoogleMapEmbedUrl(mapUrl, queryFallback);

  const directMapLink =
    mapUrl && mapUrl.trim()
      ? mapUrl.trim().startsWith("http")
        ? mapUrl.trim()
        : `https://${mapUrl.trim()}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryFallback)}`;

  if (!embedUrl) {
    return null;
  }

  return (
    <div
      style={{
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        background: "#0f172a",
        position: "relative",
        marginTop: "0.75rem",
      }}
    >
      {/* Top Map Pin Title Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 0.85rem",
          background: "#1e293b",
          borderBottom: "1px solid #334155",
          color: "#f8fafc",
          fontSize: "0.8rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <MapPin size={15} color="#10b981" />
          <span style={{ fontWeight: 700 }}>
            {groundName || location || "Pinned Venue Location"}
          </span>
          {pincode && (
            <span
              style={{
                fontSize: "0.72rem",
                background: "rgba(16, 185, 129, 0.2)",
                color: "#34d399",
                padding: "0.1rem 0.45rem",
                borderRadius: "4px",
                fontWeight: 700,
              }}
            >
              PIN: {pincode}
            </span>
          )}
        </div>

        <a
          href={directMapLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            color: "#38bdf8",
            textDecoration: "none",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
          title="Open Location in Google Maps app or browser"
        >
          <span>Open in Google Maps</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Embedded Pinned Iframe */}
      <iframe
        title="Pinned Google Map Location"
        src={embedUrl}
        width="100%"
        height={height}
        style={{ border: 0, display: "block" }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};
