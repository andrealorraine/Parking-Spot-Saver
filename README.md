# Parking Spot Saver

A mobile-first, installable PWA that remembers where you parked at the mall and how long you have been there.

## Environment variables

| Name | Where it is used | Notes |
| --- | --- | --- |
| `GOOGLE_PLACES_API_KEY` | Server only (`/api/malls/*` Route Handlers) | Secret. Enable **Places API (New)**. Never prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Browser (map on `/car`) | Public. Enable **Maps JavaScript API** and restrict it by **HTTP referrer** to your Vercel domains (e.g. `https://your-app.vercel.app/*`). |

Add both in Vercel under Project → Settings → Environment Variables. The app still runs without them and shows a setup message instead of the mall list or the map.

## Pages

- `/`: active spot sign (level/zone), live timer, limit progress with warnings, fee estimate, recent spots
- `/save`: find nearby malls (Places searchNearby), search malls by name (Places searchText), level, zone, note, limit, rate, photo
- `/car`: map with car, mall, and your live position, plus walking directions
- `/history`: last 20 spots, with delete

## Data

Everything is stored in `localStorage` on the device (active spot plus history). There is no login and no database. Photos are compressed client-side to 720 px JPEG at 0.7 quality.

## Development

```bash
pnpm install
pnpm dev
```
