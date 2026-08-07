import * as maplibregl from 'maplibre-gl';
import {
  CircleManager,
  MapProjection,
  MapProvider,
  MarkerManager,
  MarkerTilingOptions,
  PolygonManager,
  PolylineManager,
  type GeoRectBounds,
  type MapConfig,
  type MapViewControllerInterface,
  withRasterHeaderTransform,
} from '@mapconductor/js-sdk-core';
import { MapTilerViewController } from './MapTilerViewController';
import { buildStyleJsonURL } from './MapTilerDesign';
import { ZoomAltitudeConverter } from './zoom/ZoomAltitudeConverter';
import { toCameraPosition } from './MapCameraPosition';
import { MapTilerMapViewHolder } from './MapTilerMapViewHolder';
import { MapTilerMarkerController } from './marker/MapTilerMarkerController';
import { MapTilerMarkerEventController } from './marker/MapTilerMarkerEventController';
import { MapTilerMarkerOverlayRenderer } from './marker/MapTilerMarkerOverlayRenderer';
import { MarkerLayer, type MapTilerActualMarker } from './marker/MarkerLayer';
import { MarkerDragLayer } from './marker/MarkerDragLayer';
import { MapTilerCircleController } from './circle/MapTilerCircleController';
import { MapTilerCircleLayer, type MapTilerActualCircle } from './circle/MapTilerCircleLayer';
import { MapTilerCircleOverlayRenderer } from './circle/MapTilerCircleOverlayRenderer';
import { MapTilerPolylineController } from './polyline/MapTilerPolylineController';
import { MapTilerPolylineLayer, type MapTilerActualPolyline } from './polyline/MapTilerPolylineLayer';
import { MapTilerPolylineOverlayRenderer } from './polyline/MapTilerPolylineOverlayRenderer';
import { MapTilerPolygonConductor } from './polygon/MapTilerPolygonConductor';
import { MapTilerPolygonLayer, type MapTilerActualPolygon } from './polygon/MapTilerPolygonLayer';
import { MapTilerPolygonOverlayRenderer } from './polygon/MapTilerPolygonOverlayRenderer';
import { MapTilerGroundImageController } from './groundimage/MapTilerGroundImageController';
import { MapTilerGroundImageOverlayRenderer } from './groundimage/MapTilerGroundImageOverlayRenderer';
import { MapTilerRasterLayerController } from './raster/MapTilerRasterLayerController';
import { MapTilerRasterLayerOverlayRenderer } from './raster/MapTilerRasterLayerOverlayRenderer';

export interface MapTilerConfig extends MapConfig {
  /** MapTiler Cloud API key. Used to build the style.json URL when [styleId] is set. */
  apiKey?: string;
  /** MapTiler Cloud map id (e.g. 'streets-v2'). Combined with [apiKey] into a style URL. */
  styleId?: string;
  /** Explicit MapLibre style (URL or spec). Takes precedence over [styleId] when provided. */
  style?: string | maplibregl.StyleSpecification;
  maxZoom?: number;
  minZoom?: number;
  /** Restricts panning/zooming so the viewport cannot leave this rectangle. */
  restrictBounds?: GeoRectBounds;
  projection?: MapProjection;
  markerTilingOptions?: MarkerTilingOptions;
}

function toLngLatBounds(bounds: GeoRectBounds | undefined): maplibregl.LngLatBoundsLike | undefined {
  if (!bounds?.southWest || !bounds.northEast) return undefined;
  return [
    [bounds.southWest.longitude, bounds.southWest.latitude],
    [bounds.northEast.longitude, bounds.northEast.latitude],
  ];
}

// Sentinel used to silently cancel initialization when destroy() is called before load.
// Distinct from real errors so callers can ignore it without swallowing actual failures.
const DESTROYED_BEFORE_LOAD = Symbol('DESTROYED_BEFORE_LOAD');

/**
 * MapTiler provider implementation
 */
export class MapTilerProvider extends MapProvider {
  // Track map separately from controller so destroy() works even during async init
  private map: maplibregl.Map | null = null;

  async initialize(config: MapTilerConfig): Promise<MapViewControllerInterface> {
    if (this.controller) {
      return this.controller;
    }

    const container =
      typeof config.container === 'string'
        ? document.getElementById(config.container)
        : config.container;

    if (!container) {
      throw new Error('Container element not found');
    }

    const initialCamera = config.initCameraPosition ? toCameraPosition(config.initCameraPosition) : null;
    // MapTiler serves MapLibre GL styles from api.maptiler.com; build the style
    // URL from the map id + API key unless an explicit style was supplied.
    const style =
      config.style ??
      buildStyleJsonURL(config.styleId ?? 'streets-v2', config.apiKey ?? '');
    const map = new maplibregl.Map({
      container,
      style,
      center: initialCamera?.center ?? [0, 0],
      zoom: initialCamera?.zoom ?? ZoomAltitudeConverter.googleZoomToMaplibreZoom(10),
      bearing: initialCamera?.bearing ?? 0,
      pitch: initialCamera?.tilt ?? 0,
      maxZoom: config.maxZoom !== undefined ? ZoomAltitudeConverter.googleZoomToMaplibreZoom(config.maxZoom) : undefined,
      minZoom: config.minZoom !== undefined ? ZoomAltitudeConverter.googleZoomToMaplibreZoom(config.minZoom) : undefined,
      maxBounds: toLngLatBounds(config.restrictBounds),
      ...config.options,
      // RasterLayer の extraHeaders をタイル要求に載せる唯一の口（MapLibreProvider と同じ）。
      transformRequest: withRasterHeaderTransform(config.options?.transformRequest),
    } as maplibregl.MapOptions);

    // Track map immediately so destroy() can remove it even before load fires
    this.map = map;

    await new Promise<void>((resolve, reject) => {
      map.once('load', () => {
        map.setProjection({
          type: config.projection === MapProjection.Globe ? 'globe' : 'mercator',
        });
        resolve();
      });
      // If destroy() is called before load fires, reject with the sentinel so the
      // caller can distinguish an intentional cleanup from an unexpected error.
      map.once('remove', () => reject(DESTROYED_BEFORE_LOAD));
    });

    // If destroy() was called during initialization, bail out silently
    if (!this.map) {
      throw DESTROYED_BEFORE_LOAD;
    }

    const holder = new MapTilerMapViewHolder(map.getContainer(), map);
    // Rely solely on styleReady rather than also calling isStyleLoaded() here.
    // isStyleLoaded() can return false transiently while MapTiler processes an
    // addLayer/addSource call, which would incorrectly block overlay resync.
    const styleReadyRef = { current: true };
    const canEditStyle = () => styleReadyRef.current;
    const markerController = getMarkerController(holder, canEditStyle, config);
    const markerEventController = new MapTilerMarkerEventController(markerController);
    const circleController = getCircleController(holder, canEditStyle);
    const polylineController = getPolylineController(holder, canEditStyle);
    const polygonController = getPolygonController(holder, canEditStyle);
    const groundImageController = getGroundImageController(holder, canEditStyle);
    const rasterLayerController = getRasterLayerController(holder, canEditStyle);

    this.controller = new MapTilerViewController(
      holder,
      markerController,
      markerEventController,
      circleController,
      polylineController,
      polygonController,
      groundImageController,
      rasterLayerController,
      styleReadyRef,
      config.initCameraPosition?.tilt ?? null,
      config.projection ?? MapProjection.Mercator,
    );
    return this.controller;
  }

  destroy(): void {
    if (this.controller) {
      this.controller.destroy();
      this.controller = null;
    } else if (this.map) {
      // Map was created but controller hasn't been set yet (load not fired)
      this.map.remove();
    }
    this.map = null;
  }

  /** Returns true if the rejection was caused by an intentional destroy() call. */
  static isDestroyedBeforeLoad(error: unknown): boolean {
    return error === DESTROYED_BEFORE_LOAD;
  }
}

function getMarkerController(
  holder: MapTilerMapViewHolder,
  canEditStyle: () => boolean,
  config: MapTilerConfig,
): MapTilerMarkerController {
  const markerManager = MarkerManager.defaultManager<MapTilerActualMarker>();
  const markerLayer = new MarkerLayer({
    holder,
    canEditStyle,
    sourceId: 'mc-markers',
    layerId: 'mc-marker-layer',
  });
  const dragLayer = new MarkerDragLayer({
    holder,
    canEditStyle,
    sourceId: 'mc-marker-drag',
    layerId: 'mc-marker-drag-layer',
  });
  const renderer = new MapTilerMarkerOverlayRenderer({
    holder,
    markerManager,
    markerLayer,
    dragLayer,
  });
  return new MapTilerMarkerController(holder, renderer, config.markerTilingOptions);
}

function getCircleController(
  holder: MapTilerMapViewHolder,
  canEditStyle: () => boolean,
): MapTilerCircleController {
  const circleManager = new CircleManager<MapTilerActualCircle>();
  const layer = new MapTilerCircleLayer({ holder, canEditStyle });
  const renderer = new MapTilerCircleOverlayRenderer({ layer, circleManager, holder });
  return new MapTilerCircleController(renderer);
}

function getPolylineController(
  holder: MapTilerMapViewHolder,
  canEditStyle: () => boolean,
): MapTilerPolylineController {
  const polylineManager = new PolylineManager<MapTilerActualPolyline>();
  const layer = new MapTilerPolylineLayer({ holder, canEditStyle });
  const renderer = new MapTilerPolylineOverlayRenderer({ layer, polylineManager, holder });
  return new MapTilerPolylineController(renderer);
}

function getPolygonController(
  holder: MapTilerMapViewHolder,
  canEditStyle: () => boolean,
): MapTilerPolygonConductor {
  const polygonManager = new PolygonManager<MapTilerActualPolygon>();
  const layer = new MapTilerPolygonLayer({ holder, canEditStyle });
  const renderer = new MapTilerPolygonOverlayRenderer({ layer, polygonManager, holder });
  return new MapTilerPolygonConductor(renderer);
}

function getGroundImageController(
  holder: MapTilerMapViewHolder,
  canEditStyle: () => boolean,
): MapTilerGroundImageController {
  const renderer = new MapTilerGroundImageOverlayRenderer({ holder, canEditStyle });
  return new MapTilerGroundImageController(renderer);
}

function getRasterLayerController(
  holder: MapTilerMapViewHolder,
  canEditStyle: () => boolean,
): MapTilerRasterLayerController {
  const renderer = new MapTilerRasterLayerOverlayRenderer(holder, canEditStyle);
  return new MapTilerRasterLayerController(renderer);
}
