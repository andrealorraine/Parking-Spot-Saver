import { callPlaces, errorResponse, parseCoord, withDistance } from '@/lib/places'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim().slice(0, 100)
  if (q.length < 2) return Response.json({ malls: [] })

  const lat = parseCoord(searchParams.get('lat'), 90)
  const lng = parseCoord(searchParams.get('lng'), 180)

  try {
    const malls = await callPlaces('searchText', {
      textQuery: `${q} shopping mall`,
      maxResultCount: 10,
    })
    return Response.json({ malls: lat !== null && lng !== null ? withDistance(malls, lat, lng) : malls })
  } catch (err) {
    return errorResponse(err)
  }
}
