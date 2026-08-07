export { MapTilerProvider } from './MapTilerProvider';
export { MapTilerViewController } from './MapTilerViewController';
export { MapTilerMapView, MapTilerMapView2D } from './MapTilerView.web';
export { MapTilerDesign } from './MapTilerDesign';
export { MapTilerViewState, useMapTilerViewState } from './MapTilerViewState';
export type { MapTilerMapDesignType } from './MapTilerDesign';
export type { MapTilerViewStateInterface } from './MapTilerViewState';
export type { MapTilerConfig } from './MapTilerProvider';
export type { MapTilerMapViewProps } from './MapTilerView.web';
export { ZoomAltitudeConverter } from './zoom/ZoomAltitudeConverter';

// MapTiler renders through MapLibre GL JS. MapLibre GL JS v6 ships ESM-only and
// loads its Web Worker from a real URL. With a bundler (Vite, webpack, esbuild,
// Rollup) that URL must be provided once before the first map is created.
// Re-exported here so consumers can configure it without adding `maplibre-gl` as
// a direct dependency. See the README for the per-bundler snippet.
export { setWorkerUrl as setMapTilerWorkerUrl } from 'maplibre-gl';
