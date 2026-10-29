import {
  RasterLayerController,
  RasterLayerManager,
  type RasterHeaderSupport,
} from '@mapconductor/js-sdk-core';
import {
  type MapTilerRasterLayerHandle,
  MapTilerRasterLayerOverlayRenderer,
} from './MapTilerRasterLayerOverlayRenderer';

/**
 * android-sdk の MapTilerRasterLayerController と同じく汎用 RasterLayerController の薄い
 * サブクラス。composition/update/has/clear は基底クラスが提供する。GL スタイルが
 * 再読み込みされると既存のソース・レイヤーは失われるため、基底クラスの resync() で
 * 登録済みのラスターレイヤーを貼り直す（android-sdk の reapplyStyle 相当）。
 */
export class MapTilerRasterLayerController extends RasterLayerController<MapTilerRasterLayerHandle> {
  /**
   * MapTiler の web SDK は maplibre-gl なので MapLibre と同じ transformRequest 経路。
   * android の MapTiler は WebView なので載せられない（プラットフォームで事情が違う）。
   *
   * userAgent はブラウザが上書きを許さないので、どのプロバイダでも web では効かない。
   */
  protected override get headerSupport(): RasterHeaderSupport {
    return { provider: 'MapTiler', extraHeaders: true };
  }

  constructor(renderer: MapTilerRasterLayerOverlayRenderer) {
    super({ rasterLayerManager: new RasterLayerManager<MapTilerRasterLayerHandle>(), renderer });
  }
}
