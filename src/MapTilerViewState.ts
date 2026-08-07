import { useState } from 'react';
import {
  MapViewState,
  type MapViewStateInterface,
  type GeoPoint,
  type MapCameraPosition,
  type MapViewControllerInterface,
  type GeoRectBounds,
  type MapViewHolder,
  MapCameraPosition as MapCameraPositionNS,
  createRandomId,
} from '@mapconductor/js-sdk-core';
import { MapTilerDesign, type MapTilerMapDesignType } from './MapTilerDesign';

export interface MapTilerViewStateInterface
  extends MapViewStateInterface<MapTilerMapDesignType> {
  /** MapTiler Cloud API key used to load the style/tiles. */
  readonly apiKey: string;
}

export interface MapTilerViewStateParams {
  id?: string;
  /** MapTiler Cloud API key. Required for the map/tiles to load. */
  apiKey?: string;
  mapDesignType?: MapTilerMapDesignType;
  cameraPosition?: MapCameraPosition;
}

export class MapTilerViewState
  extends MapViewState<MapTilerMapDesignType>
  implements MapTilerViewStateInterface {
  readonly id: string;
  readonly apiKey: string;
  private _cameraPosition: MapCameraPosition;
  private _mapDesignType: MapTilerMapDesignType;
  private _controller: MapViewControllerInterface | null = null;
  private _cameraPositionChangeListener: ((camera: MapCameraPosition) => void) | null = null;

  constructor({
    id = createRandomId(),
    apiKey = '',
    mapDesignType = MapTilerDesign.Streets,
    cameraPosition = MapCameraPositionNS.Default,
  }: MapTilerViewStateParams = {}) {
    super();
    this.id = id;
    this.apiKey = apiKey;
    this._cameraPosition = cameraPosition;
    this._mapDesignType = mapDesignType;
  }

  override get cameraPosition(): MapCameraPosition {
    return this._cameraPosition;
  }

  override get mapDesignType(): MapTilerMapDesignType {
    return this._mapDesignType;
  }

  override set mapDesignType(value: MapTilerMapDesignType) {
    this._mapDesignType = value;
  }

  override moveCameraTo(position: GeoPoint, durationMillis?: number): void;
  override moveCameraTo(cameraPosition: MapCameraPosition, durationMillis?: number): void;
  override moveCameraTo(positionOrCamera: GeoPoint | MapCameraPosition, durationMillis?: number): void {
    const newPosition = 'zoom' in positionOrCamera
      ? this.resolveCameraPosition(positionOrCamera as MapCameraPosition)
      : this._cameraPosition.copy({ position: positionOrCamera as GeoPoint });

    const ctrl = this._controller;
    if (!ctrl) {
      this._cameraPosition = newPosition;
      return;
    }

    if (!durationMillis || durationMillis === 0) {
      ctrl.moveCamera(newPosition);
    } else {
      void ctrl.animateCamera(newPosition, durationMillis);
    }
    this._cameraPosition = newPosition;
    this._cameraPositionChangeListener?.(newPosition);
  }

  override getMapViewHolder(): MapViewHolder<unknown, unknown> | null {
    return this._controller?.holder ?? null;
  }

  override fitBounds(bounds: GeoRectBounds, padding: number = 0): void {
    void this._controller?.fitBounds(bounds, padding);
  }

  // Called by MapTilerView when controller is initialized
  setController(ctrl: MapViewControllerInterface | null): void {
    this._controller = ctrl;
    if (ctrl) ctrl.moveCamera(this._cameraPosition);
  }

  // Called by MapTilerView when camera position changes
  updateCameraPosition(camera: MapCameraPosition): void {
    this._cameraPosition = camera;
    this._cameraPositionChangeListener?.(camera);
  }

  setCameraPositionChangeListener(listener: ((camera: MapCameraPosition) => void) | null): void {
    this._cameraPositionChangeListener = listener;
  }

  // If zoom/bearing/tilt are all 0, treat as position-only update (matches Android/iOS behavior)
  private resolveCameraPosition(target: MapCameraPosition): MapCameraPosition {
    const isUnspecified = target.zoom === 0 && target.bearing === 0 && target.tilt === 0;
    if (isUnspecified) return this._cameraPosition.copy({ position: target.position });
    return target;
  }
}

export function useMapTilerViewState(params: MapTilerViewStateParams = {}): MapTilerViewState {
  const [state] = useState(() => new MapTilerViewState(params));
  return state;
}
