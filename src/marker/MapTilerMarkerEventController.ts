import { DefaultMarkerEventController, type MarkerEventHost } from '@mapconductor/js-sdk-core';
import { MapTilerMarkerController } from './MapTilerMarkerController';
import { type MapTilerActualMarker } from './MarkerLayer';

/**
 * MapTiler のマーカーイベント。
 *
 * ドラッグの状態遷移・パン抑止・リスナー転送はすべてコアの
 * {@link DefaultMarkerEventController} が持つ。ここに残るのは
 * **MapTiler 固有のもの**だけ——いまは何も無い。
 *
 * 移行前はこのファイルが 165 行あり、maplibre / mapbox / maptiler / tomtom / longdo の
 * 5 本が**型名以外 1 文字も違わなかった**。
 */
export class MapTilerMarkerEventController extends DefaultMarkerEventController<MapTilerActualMarker> {
    constructor(controller: MapTilerMarkerController) {
        super(controller as unknown as MarkerEventHost<MapTilerActualMarker>);
    }
}
