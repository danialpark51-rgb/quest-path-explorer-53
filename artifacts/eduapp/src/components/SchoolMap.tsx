import { useEffect, useState } from "react";
import { MapPin, ExternalLink, Loader2, School } from "lucide-react";

type GeoResult = {
  lat: string;
  lon: string;
  display_name: string;
};

type SchoolMapProps = {
  schoolName: string;
};

const SchoolMap = ({ schoolName }: SchoolMapProps) => {
  const [geo, setGeo] = useState<GeoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!schoolName || schoolName.trim().length < 3) return;

    let cancelled = false;
    setLoading(true);
    setError(false);
    setGeo(null);

    const query = encodeURIComponent(`${schoolName} school India`);
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=1`,
      { headers: { "Accept-Language": "en", "User-Agent": "EduPath/1.0" } }
    )
      .then((r) => r.json())
      .then((data: GeoResult[]) => {
        if (cancelled) return;
        if (data && data.length > 0) {
          setGeo(data[0]);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [schoolName]);

  if (!schoolName || schoolName.trim().length < 3) return null;

  const lat = geo ? parseFloat(geo.lat) : null;
  const lon = geo ? parseFloat(geo.lon) : null;
  const zoom = 16;

  const mapUrl = lat && lon
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.005},${lat - 0.005},${lon + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lon}`
    : null;

  const openMapUrl = lat && lon
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(schoolName + " India")}`;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <School className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{schoolName}</p>
            {geo && (
              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[220px]">
                {formatAddress(geo.display_name)}
              </p>
            )}
          </div>
        </div>
        <a
          href={openMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0"
        >
          <MapPin className="w-3 h-3" />
          Open
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Map Area */}
      <div className="relative h-48 bg-muted">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Finding location…</p>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
            <MapPin className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground text-center px-4">
              Location not found. Try a more specific school name.
            </p>
            <a href={openMapUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary hover:underline">
              Search on OpenStreetMap →
            </a>
          </div>
        )}

        {mapUrl && !loading && (
          <iframe
            title={`Map of ${schoolName}`}
            src={mapUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
    </div>
  );
};

function formatAddress(displayName: string): string {
  const parts = displayName.split(",").map((p) => p.trim());
  return parts.slice(0, 3).join(", ");
}

export default SchoolMap;
