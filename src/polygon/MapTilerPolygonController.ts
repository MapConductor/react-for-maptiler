import { PolygonController } from '@mapconductor/js-sdk-core';
import type { MapTilerActualPolygon } from './MapTilerPolygonLayer';
import { MapTilerPolygonOverlayRenderer } from './MapTilerPolygonOverlayRenderer';

/**
 * core の {@link PolygonController} をそのまま使う。差分管理（fingerprint による
 * 追加・変更・削除の振り分け）、直列化、`has`、クリックカスケード（`resolveTap`）は
 * すべて core 側の実装で、ここには持たない。
 *
 * 塗りと輪郭は {@link MapTilerPolygonOverlayRenderer} が 1 つのレンダラーで描く
 * （fill レイヤーは線幅を持てないので、輪郭は line レイヤーに別ソースで描く）。
 * レンダラーは `onPostProcess()` でマネージャ全体から GeoJSON ソースを書き直す方式で、
 * `removePolygon()` は何もしない。
 */
export class MapTilerPolygonController extends PolygonController<MapTilerActualPolygon> {
  declare readonly renderer: MapTilerPolygonOverlayRenderer;

  constructor(renderer: MapTilerPolygonOverlayRenderer) {
    super({ polygonManager: renderer.polygonManager, renderer });
  }

  /** スタイルの再読み込みで消えたソース／レイヤーを、マネージャの内容から描き直す。 */
  async resync(): Promise<void> {
    await this.renderer.onPostProcess();
  }

  /**
   * core の `clear()` は `onRemove` → マネージャを空にする、までで描き直さない。
   * このレンダラーは `onPostProcess()` でしか地図に反映しないので、ここで描き直す
   * （同じ方式のポリラインコントローラと同じ）。
   */
  override async clear(): Promise<void> {
    await super.clear();
    await this.renderer.onPostProcess();
  }
}
