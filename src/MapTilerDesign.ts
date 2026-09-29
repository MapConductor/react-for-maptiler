import type { AttributionRule, MapDesignTypeInterface } from '@mapconductor/js-sdk-core';

export interface MapTilerMapDesignType extends MapDesignTypeInterface<string> {
  /** MapTiler Cloud map id (e.g. 'streets-v2', 'satellite'). */
  readonly styleId: string;
}

/**
 * Builds the MapTiler Cloud style.json URL for a given map id and API key.
 *
 * MapTiler serves MapLibre GL styles from `https://api.maptiler.com/maps/<id>/style.json?key=<key>`.
 * The key is required for the tiles to load.
 */
export function buildStyleJsonURL(styleId: string, apiKey: string): string {
  return `https://api.maptiler.com/maps/${styleId}/style.json?key=${apiKey}`;
}

/**
 * MapTiler map design (a MapTiler Cloud reference style).
 *
 * `id` / `getValue()` is the stable key (used for save/restore and as the map
 * re-init trigger); the value actually loaded is the MapTiler style.json for
 * [styleId], resolved with the view state's API key. Mirrors android
 * `MapTilerDesign` (Streets / StreetsDark / Satellite / …) one-to-one.
 */
export class MapTilerDesign implements MapTilerMapDesignType {
  readonly id: string;
  readonly styleId: string;
  readonly attributionRules: readonly AttributionRule[];

  constructor(
    id: string,
    styleId: string,
    attributionRules: readonly AttributionRule[] = []
  ) {
    this.id = id;
    this.styleId = styleId;
    this.attributionRules = attributionRules;
  }

  getValue(): string {
    return `mapDesign_id=${this.id},style=${this.styleId}`;
  }

  /** No basemap: a background colour and nothing else. */
  static readonly None = new MapTilerDesign('None', 'none');
  static readonly Streets = new MapTilerDesign('Streets', 'streets-v2');
  static readonly StreetsDark = new MapTilerDesign('StreetsDark', 'streets-v2-dark');
  static readonly StreetsLight = new MapTilerDesign('StreetsLight', 'streets-v2-light');
  static readonly Basic = new MapTilerDesign('Basic', 'basic-v2');
  static readonly Bright = new MapTilerDesign('Bright', 'bright-v2');
  static readonly Satellite = new MapTilerDesign('Satellite', 'satellite');
  static readonly Outdoor = new MapTilerDesign('Outdoor', 'outdoor-v2');
  static readonly Winter = new MapTilerDesign('Winter', 'winter-v2');
  static readonly Topo = new MapTilerDesign('Topo', 'topo-v2');
  static readonly Toner = new MapTilerDesign('Toner', 'toner-v2');
  static readonly Dataviz = new MapTilerDesign('Dataviz', 'dataviz');
  static readonly Backdrop = new MapTilerDesign('Backdrop', 'backdrop');
  static readonly Ocean = new MapTilerDesign('Ocean', 'ocean');
  static readonly Landscape = new MapTilerDesign('Landscape', 'landscape');
  static readonly Aquarelle = new MapTilerDesign('Aquarelle', 'aquarelle');
  static readonly OpenStreetMap = new MapTilerDesign('OpenStreetMap', 'openstreetmap');
}
