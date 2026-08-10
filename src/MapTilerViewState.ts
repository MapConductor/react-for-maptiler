import {
  useState } from 'react';
import {
  MapViewState,
  type MapViewStateInterface,
  type MapCameraPosition,
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
  readonly apiKey: string;
  private _mapDesignType: MapTilerMapDesignType;

  constructor({
    id = createRandomId(),
    apiKey = '',
    mapDesignType = MapTilerDesign.Streets,
    cameraPosition = MapCameraPositionNS.Default,
  }: MapTilerViewStateParams = {}) {
    super({ id, cameraPosition });
    this.apiKey = apiKey;
    this._mapDesignType = mapDesignType;
  }

  override get mapDesignType(): MapTilerMapDesignType {
    return this._mapDesignType;
  }

  override set mapDesignType(value: MapTilerMapDesignType) {
    this._mapDesignType = value;
  }

  // Called by MapTilerView when controller is initialized

  // Called by MapTilerView when camera position changes

  // If zoom/bearing/tilt are all 0, treat as position-only update (matches Android/iOS behavior)
}

export function useMapTilerViewState(params: MapTilerViewStateParams = {}): MapTilerViewStateInterface {
  const [state] = useState(() => new MapTilerViewState(params));
  return state;
}
