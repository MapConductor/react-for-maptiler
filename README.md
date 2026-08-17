# @mapconductor/react-for-maptiler

MapTiler provider for the MapConductor React SDK. Renders a MapTiler Cloud map
(via MapLibre GL JS) through MapConductor's provider-independent camera, marker,
and overlay API, so the same application code can also run on Google Maps,
MapLibre, Mapbox, Leaflet, OpenLayers, ArcGIS, Cesium, HERE, or TomTom.

## Installation

```shell
npm install @mapconductor/react-for-maptiler @mapconductor/js-sdk-core @mapconductor/js-sdk-react
```

`maplibre-gl` (v6) is bundled as a dependency and does the actual rendering.

## API key

MapTiler tiles require a [MapTiler Cloud](https://cloud.maptiler.com/) API key.
Pass it to the view state:

```tsx
const state = useMapTilerViewState({
  apiKey: MAPTILER,
  mapDesignType: MapTilerDesign.Streets,
  cameraPosition,
});
```

## Usage

```tsx
import {
  MapTilerDesign,
  MapTilerMapView2D,
  useMapTilerViewState,
} from '@mapconductor/react-for-maptiler';
import '@mapconductor/react-for-maptiler/style.css';
import { MapCameraPosition, createGeoPoint } from '@mapconductor/js-sdk-core';

// Your own key. Read it from your environment however your build tool does
// it, and keep it out of source control.
const MAPTILER = '…';

function Map() {
  const state = useMapTilerViewState({
    apiKey: MAPTILER,
    mapDesignType: MapTilerDesign.Streets,
    cameraPosition: MapCameraPosition.create({
      position: createGeoPoint({ latitude: 35.6812, longitude: 139.7671 }),
      zoom: 11,
    }),
  });

  return <MapTilerMapView2D state={state} />;
}
```

## Bundler setup (MapLibre GL JS v6)

MapTiler renders through MapLibre GL JS. MapLibre GL JS v6 is ESM-only and loads
its Web Worker from a URL. With a bundler (Vite, webpack, esbuild, Rollup) that
URL must be registered once, before the first map is created. This package
re-exports maplibre's `setWorkerUrl` as `setMapTilerWorkerUrl` so you can do it
without importing `maplibre-gl` directly — useful when you depend on
`@mapconductor/react-for-maptiler` alone:

```ts
// Vite
import { setMapTilerWorkerUrl } from '@mapconductor/react-for-maptiler';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setMapTilerWorkerUrl(workerUrl);
```

```ts
// webpack 5+ / esbuild / Rollup (after copying the worker next to your bundle)
import { setMapTilerWorkerUrl } from '@mapconductor/react-for-maptiler';

setMapTilerWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).toString());
```

In many setups (e.g. Vite) MapLibre GL v6 resolves the worker automatically and
this call is unnecessary. It is also redundant if you already register the
worker through `@mapconductor/react-for-maplibre` in the same app: both share the
single deduped `maplibre-gl` instance, so one registration covers both. For SSR
with Vite, add `maplibre-gl` to `ssr.noExternal` so the worker-URL import
resolves through Vite.

## Available designs

`MapTilerDesign` exposes MapTiler Cloud reference styles, mirroring the android
`MapTilerDesign`: `Streets`, `StreetsDark`, `StreetsLight`, `Basic`, `Bright`,
`Satellite`, `Outdoor`, `Winter`, `Topo`, `Toner`, `Dataviz`, `Backdrop`,
`Ocean`, `Landscape`, `Aquarelle`, `OpenStreetMap`.

## License

Apache-2.0
