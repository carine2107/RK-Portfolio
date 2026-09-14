import 'server-only'

import { geoBounds, geoNaturalEarth1, geoPath } from 'd3-geo'
import countries from 'i18n-iso-countries'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import world from 'world-atlas/countries-110m.json'

/**
 * Europe–Africa base map, computed on the server from Natural Earth data
 * (world-atlas, public domain): no tile server, no third-party request, no
 * tracking. Only SVG path strings reach the browser.
 */

export type MapShape = {
  /** ISO 3166-1 alpha-2 code, null for territories without one. */
  code: string | null
  d: string
}

export type WorldMap = { width: number; height: number; shapes: MapShape[] }

/** Longitude / latitude window: Europe and Africa, with the Middle East edge. */
const WEST = -26
const EAST = 58
const SOUTH = -36
const NORTH = 71

const WIDTH = 520
const HEIGHT = 640

let cached: WorldMap | null = null

export function getEuropeAfricaMap(): WorldMap {
  if (cached) return cached

  const topology = world as unknown as Topology<{ countries: GeometryCollection }>
  const collection = feature(topology, topology.objects.countries)

  const projection = geoNaturalEarth1()
    .rotate([-16, 0])
    .fitExtent(
      [
        [4, 4],
        [WIDTH - 4, HEIGHT - 4],
      ],
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiPoint',
          coordinates: [
            [WEST, SOUTH],
            [EAST, SOUTH],
            [WEST, NORTH],
            [EAST, NORTH],
            [16, NORTH],
            [16, SOUTH],
          ],
        },
      },
    )
    .clipExtent([
      [0, 0],
      [WIDTH, HEIGHT],
    ])

  const path = geoPath(projection).digits(1)

  const shapes: MapShape[] = []
  for (const country of collection.features) {
    const [[minLon, minLat], [maxLon, maxLat]] = geoBounds(country)
    const outside = maxLon < WEST || minLon > EAST || maxLat < SOUTH || minLat > NORTH
    // geoBounds wraps across the antimeridian (Russia, Fiji): keep those.
    if (outside && minLon <= maxLon) continue

    const d = path(country)
    if (!d) continue

    const numeric = country.id === undefined ? null : String(country.id).padStart(3, '0')
    shapes.push({ code: (numeric && countries.numericToAlpha2(numeric)) || null, d })
  }

  cached = { width: WIDTH, height: HEIGHT, shapes }
  return cached
}
