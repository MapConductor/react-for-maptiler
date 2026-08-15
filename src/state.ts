// React Native から安全に読める入口。地図の描画実装（`MapTilerView.web`）を含まない。
//
// ルートの barrel は maplibre-gl を実行時に引き込む。ブラウザ向けバンドラなら問題ないが、
// Metro/Hermes はこれを即時評価するため、React Native に存在しないブラウザの
// グローバル（window / document）で落ちる。
// `@mapconductor/reactnative-for-maptiler` はルートではなくここから import する。
// react-for-longdo / react-for-maplibre / react-for-arcgis の state.ts と同じ取り決め。
//
// ここから出す 2 つは web SDK を実行時に一切参照しない
// （`MapTilerDesign` の import は型のみ）。
export { MapTilerDesign, type MapTilerMapDesignType } from './MapTilerDesign';
export {
  MapTilerViewState,
  useMapTilerViewState,
  type MapTilerViewStateInterface,
  type MapTilerViewStateParams,
} from './MapTilerViewState';
