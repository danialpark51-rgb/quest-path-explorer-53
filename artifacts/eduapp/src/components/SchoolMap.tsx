import { useEffect, useState } from "react";
import { MapPin, ExternalLink, Loader2, School, Star } from "lucide-react";

type SchoolInfo = {
  found: boolean;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  photoUrl?: string | null;
  embedUrl: string;
  rating?: number | null;
  totalRatings?: number | null;
  mapsUrl?: string;
};

type SchoolMapProps = {
  schoolName: string;
};

const SchoolMap = ({ schoolName }: SchoolMapProps) => {
  const [info, setInfo] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!schoolName || schoolName.trim().length < 3) return;
    let cancelled = false;
    setLoading(true);
    setInfo(null);
    setImgError(false);

    fetch(`/api/school-info?name=${encodeURIComponent(schoolName)}`)
      .then((r) => r.json())
      .then((data: SchoolInfo) => { if (!cancelled) setInfo(data); })
      .catch(() => { if (!cancelled) setInfo(null); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [schoolName]);

  if (!schoolName || schoolName.trim().length < 3) return null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <School className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{info?.name ?? schoolName}</p>
            {info?.address && (
              <p className="text-xs text-muted-foreground line-clamp-1">{info.address}</p>
            )}
            {info?.rating && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-muted-foreground">{info.rating.toFixed(1)}</span>
                {info.totalRatings && (
                  <span className="text-xs text-muted-foreground">({info.totalRatings.toLocaleString()})</span>
                )}
              </div>
            )}
          </div>
        </div>
        {(info?.mapsUrl || info?.embedUrl) && (
          <a
            href={info.mapsUrl ?? info.embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0 ml-2"
          >
            <MapPin className="w-3 h-3" />
            Maps
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* School Photo */}
      {info?.photoUrl && !imgError && (
        <div className="relative h-36 bg-muted overflow-hidden">
          <img
            src={info.photoUrl}
            alt={`Photo of ${info.name}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
            <p className="text-white text-xs font-medium">{info.name}</p>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative h-52 bg-muted">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Finding your school…</p>
          </div>
        )}

        {!loading && !info && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <MapPin className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground text-center px-6">
              Could not load map. Check your connection.
            </p>
          </div>
        )}

        {!loading && info?.embedUrl && (
          <iframe
            title={`Map of ${info.name ?? schoolName}`}
            src={info.embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default SchoolMap;
