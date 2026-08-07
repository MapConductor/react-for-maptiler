import {
  AbstractPolylineOverlayRenderer,
  buildUnwrappedPolylinePath,
  type PolylineEntity,
  type PolylineManagerInterface,
  type PolylineState,
} from '@mapconductor/js-sdk-core';
import type { LineFeature } from '../helpers';
import { MapTilerMapViewHolder } from '../MapTilerMapViewHolder';
import {
  MapTilerPolylineLayer,
  type MapTilerActualPolyline,
} from './MapTilerPolylineLayer';

export class MapTilerPolylineOverlayRenderer extends AbstractPolylineOverlayRenderer<
  MapTilerMapViewHolder,
  MapTilerActualPolyline
> {
  readonly layer: MapTilerPolylineLayer;
  readonly polylineManager: PolylineManagerInterface<MapTilerActualPolyline>;

  constructor({
    layer,
    polylineManager,
    holder,
  }: {
    layer: MapTilerPolylineLayer;
    polylineManager: PolylineManagerInterface<MapTilerActualPolyline>;
    holder: MapTilerMapViewHolder;
  }) {
    super(holder);
    this.layer = layer;
    this.polylineManager = polylineManager;
  }

  async createPolyline(state: PolylineState): Promise<MapTilerActualPolyline | null> {
    if (state.points.length < 2) return null;
    return createMapTilerLines(state, this.resolveZIndex(state));
  }

  async updatePolylineProperties({
    current,
  }: {
    polyline: MapTilerActualPolyline;
    current: PolylineEntity<MapTilerActualPolyline>;
    prev: PolylineEntity<MapTilerActualPolyline>;
  }): Promise<MapTilerActualPolyline | null> {
    return this.createPolyline(current.state);
  }

  async removePolyline(_entity: PolylineEntity<MapTilerActualPolyline>): Promise<void> {
    // The source is rewritten from the remaining manager entities in onPostProcess().
  }

  override async onPostProcess(): Promise<void> {
    this.layer.draw(this.polylineManager.allEntities());
  }

  async redraw(): Promise<void> {
    await this.onPostProcess();
  }

  private resolveZIndex(state: PolylineState): number {
    if (state.zIndex !== 0) return state.zIndex;
    return typeof state.extra === 'number' ? state.extra : 0;
  }
}

function createMapTilerLines(
  state: PolylineState,
  zIndex: number,
): MapTilerActualPolyline {
  // Unwrapped path (longitudes continuous, may exceed ±180): MapTiler GL renders
  // it seamlessly across the antimeridian without splitting.
  const path = buildUnwrappedPolylinePath(state.points, state.geodesic);
  if (path.length < 2) return [];

  const feature: LineFeature = {
    type: 'Feature',
    id: `polyline-${state.id}-0`,
    geometry: {
      type: 'LineString',
      coordinates: path.map((point) => [point.longitude, point.latitude]),
    },
    properties: {
      id: `polyline-${state.id}-0`,
      [MapTilerPolylineLayer.Prop.STROKE_COLOR]: state.strokeColor,
      [MapTilerPolylineLayer.Prop.STROKE_WIDTH]: state.strokeWidth,
      [MapTilerPolylineLayer.Prop.Z_INDEX]: zIndex,
    },
  };
  return [feature];
}
