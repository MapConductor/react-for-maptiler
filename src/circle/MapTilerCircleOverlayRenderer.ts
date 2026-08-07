import {
  AbstractCircleOverlayRenderer,
  circleToRing,
  closeRing,
  type CircleEntity,
  type CircleManagerInterface,
  type CircleState,
} from '@mapconductor/js-sdk-core';
import { MapTilerMapViewHolder } from '../MapTilerMapViewHolder';
import {
  MapTilerCircleLayer,
  type MapTilerActualCircle,
} from './MapTilerCircleLayer';

export class MapTilerCircleOverlayRenderer extends AbstractCircleOverlayRenderer<
  MapTilerMapViewHolder,
  MapTilerActualCircle
> {
  readonly layer: MapTilerCircleLayer;
  readonly circleManager: CircleManagerInterface<MapTilerActualCircle>;

  constructor({
    layer,
    circleManager,
    holder,
  }: {
    layer: MapTilerCircleLayer;
    circleManager: CircleManagerInterface<MapTilerActualCircle>;
    holder: MapTilerMapViewHolder;
  }) {
    super(holder);
    this.layer = layer;
    this.circleManager = circleManager;
  }

  async createCircle(state: CircleState): Promise<MapTilerActualCircle | null> {
    return createMapTilerCircle(state);
  }

  async updateCircleProperties({
    current,
  }: {
    circle: MapTilerActualCircle;
    current: CircleEntity<MapTilerActualCircle>;
    prev: CircleEntity<MapTilerActualCircle>;
  }): Promise<MapTilerActualCircle | null> {
    return this.createCircle(current.state);
  }

  async removeCircle(_entity: CircleEntity<MapTilerActualCircle>): Promise<void> {
    // The source is rewritten from the remaining manager entities in onPostProcess().
  }

  override async onPostProcess(): Promise<void> {
    this.layer.draw(this.circleManager.allEntities());
  }

  async redraw(): Promise<void> {
    await this.onPostProcess();
  }
}

function createMapTilerCircle(state: CircleState): MapTilerActualCircle | null {
  // Ground-anchored circle polygon from the shared core geometry. The ring is
  // unwrapped (longitudes may exceed ±180), which MapTiler GL renders seamlessly
  // across the antimeridian without splitting.
  const ring = closeRing(circleToRing(state.center, state.radiusMeters, state.geodesic));
  if (ring.length < 4) return null;
  const zIndex = state.zIndex ?? calculateZIndex(state.center.latitude, state.center.longitude);

  return {
    type: 'Feature',
    id: `circle-${state.id}`,
    geometry: {
      type: 'Polygon',
      coordinates: [ring.map((point) => [point.longitude, point.latitude])],
    },
    properties: {
      id: `circle-${state.id}`,
      [MapTilerCircleLayer.Prop.FILL_COLOR]: state.fillColor,
      [MapTilerCircleLayer.Prop.STROKE_COLOR]: state.strokeColor,
      [MapTilerCircleLayer.Prop.STROKE_WIDTH]: state.strokeWidth,
      [MapTilerCircleLayer.Prop.Z_INDEX]: zIndex,
    },
  };
}

function calculateZIndex(latitude: number, longitude: number): number {
  return Math.round(-latitude * 1_000_000 - longitude);
}
