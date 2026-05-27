import { Router, type IRouter } from "express";

const router: IRouter = Router();

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
};

const CACHE = new Map<string, { data: object; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

router.get("/school-info", async (req, res) => {
  const name = (req.query.name as string)?.trim();
  if (!name || name.length < 2) {
    res.status(400).json({ error: "School name required" });
    return;
  }

  const cacheKey = name.toLowerCase();
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    res.json(cached.data);
    return;
  }

  try {
    const query = encodeURIComponent(name);
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${query}&format=json&limit=1&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "EduPath/1.0 (educational app)",
        "Accept-Language": "en",
      },
    });
    const results = (await response.json()) as NominatimResult[];

    if (!results.length) {
      const fallback = {
        found: false,
        name,
        searchUrl: `https://www.openstreetmap.org/search?query=${encodeURIComponent(name + " school India")}`,
      };
      CACHE.set(cacheKey, { data: fallback, ts: Date.now() });
      res.json(fallback);
      return;
    }

    const place = results[0];
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    const addr = place.address;
    const addressLine = [
      addr?.road,
      addr?.suburb,
      addr?.city ?? addr?.town ?? addr?.village,
      addr?.state,
    ]
      .filter(Boolean)
      .join(", ");

    // OpenStreetMap embed with precise bbox around the pin
    const delta = 0.004;
    const embedUrl =
      `https://www.openstreetmap.org/export/embed.html` +
      `?bbox=${lon - delta},${lat - delta},${lon + delta},${lat + delta}` +
      `&layer=mapnik&marker=${lat},${lon}`;

    const mapsUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;

    const data = {
      found: true,
      name: name,
      address: addressLine || place.display_name.split(",").slice(0, 3).join(", "),
      lat,
      lon,
      embedUrl,
      mapsUrl,
    };

    CACHE.set(cacheKey, { data, ts: Date.now() });
    res.json(data);
  } catch {
    res.status(502).json({ error: "Failed to fetch school location" });
  }
});

export default router;
