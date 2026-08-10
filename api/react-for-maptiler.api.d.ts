import * as maplibregl from 'maplibre-gl';
export { setWorkerUrl as setMapTilerWorkerUrl } from 'maplibre-gl';
import { MapConfig, GeoRectBounds, MapProjection, MarkerTilingOptions, MapProvider, MapViewControllerInterface, MapViewHolderBase, GeoPointInterface, Offset, GeoPoint, MarkerEntity, AbstractMarkerOverlayRenderer, MarkerManager, AddParams, ChangeParams, MarkerState, BitmapIcon, AbstractMarkerController, RasterLayerState, OnMarkerEventHandler, CircleEntity, AbstractCircleOverlayRenderer, CircleManagerInterface, CircleState, CircleController, PolylineEntity, AbstractPolylineOverlayRenderer, PolylineManagerInterface, PolylineState, PolylineController, MapCameraPosition, PolygonEntity, AbstractPolygonOverlayRenderer, PolygonManagerInterface, PolygonState, OnPolygonEventHandler, AbstractGroundImageOverlayRenderer, GroundImageState, GroundImageEntity, RasterLayerOverlayRenderer, RasterLayerAddParams, RasterLayerChangeParams, RasterLayerEntity, RasterLayerController, RasterHeaderSupport, BaseMapViewController, MarkerCapable, CircleCapable, PolylineCapable, PolygonCapable, GroundImageCapable, RasterLayerCapable, MapUISettings, OnMapInitializedHandler, MarkerAnimationOverlayHost, OnCircleEventHandler, OnPolylineEventHandler, OnGroundImageEventHandler, CameraRestriction, MapDesignTypeInterface, AttributionRule, MapViewStateInterface, MapViewState, MapViewHolder, MapViewBaseProps, WebMercatorZoomAltitudeConverter } from '@mapconductor/js-sdk-core';
import React from 'react';

interface MapTilerConfig extends MapConfig {
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
/**
 * MapTiler provider implementation
 */
declare class MapTilerProvider extends MapProvider {
    private map;
    initialize(config: MapTilerConfig): Promise<MapViewControllerInterface>;
    destroy(): void;
    /** Returns true if the rejection was caused by an intentional destroy() call. */
    static isDestroyedBeforeLoad(error: unknown): boolean;
}

declare class MapTilerMapViewHolder extends MapViewHolderBase<HTMLElement, maplibregl.Map> {
    readonly mapView: HTMLElement;
    readonly map: maplibregl.Map;
    private _controller;
    constructor(mapView: HTMLElement, map: maplibregl.Map);
    getController(): MapTilerViewController | null;
    setController(controller: MapTilerViewController): void;
    toScreenOffset(position: GeoPointInterface): Offset;
    fromScreenOffsetSync(offset: Offset): GeoPoint;
}

type Coordinate = [number, number];
type PointFeature = {
    type: 'Feature';
    id?: string | number;
    geometry: {
        type: 'Point';
        coordinates: Coordinate;
    };
    properties: Record<string, unknown>;
};
type LineFeature = {
    type: 'Feature';
    id?: string | number;
    geometry: {
        type: 'LineString';
        coordinates: Coordinate[];
    };
    properties: Record<string, unknown>;
};
type PolygonFeature = {
    type: 'Feature';
    geometry: {
        type: 'Polygon';
        coordinates: Coordinate[][];
    };
    properties: Record<string, unknown>;
};
type FeatureCollection = {
    type: 'FeatureCollection';
    features: Array<PointFeature | LineFeature | PolygonFeature>;
};

type MapTilerActualMarker = PointFeature;
declare class MarkerLayer {
    protected readonly holder: MapTilerMapViewHolder;
    protected readonly canEditStyle: () => boolean;
    readonly sourceId: string;
    readonly layerId: string;
    constructor({ holder, canEditStyle, sourceId, layerId, }: {
        holder: MapTilerMapViewHolder;
        canEditStyle: () => boolean;
        sourceId: string;
        layerId: string;
    });
    draw(entities: MarkerEntity<MapTilerActualMarker>[]): boolean;
    ensureStyleResources(): boolean;
    protected setData(data: FeatureCollection): boolean;
    setIconOffsets(offsets: ReadonlyMap<string, [number, number]>, fallback: [number, number]): void;
}

declare class MarkerDragLayer extends MarkerLayer {
    selected: MarkerEntity<MapTilerActualMarker> | null;
    constructor({ holder, canEditStyle, sourceId, layerId, }: {
        holder: MapTilerMapViewHolder;
        canEditStyle: () => boolean;
        sourceId: string;
        layerId: string;
    });
    updatePosition(position: GeoPoint): boolean;
    drawSelected(): boolean;
}

declare class MapTilerMarkerOverlayRenderer extends AbstractMarkerOverlayRenderer<MapTilerMapViewHolder, MapTilerActualMarker> {
    private readonly defaultMarkerIcon;
    private readonly iconRefCounter;
    private readonly iconBitmaps;
    private readonly pendingImageRemovals;
    readonly markerManager: MarkerManager<MapTilerActualMarker>;
    readonly markerLayer: MarkerLayer;
    readonly dragLayer: MarkerDragLayer;
    constructor({ holder, markerManager, markerLayer, dragLayer, }: {
        holder: MapTilerMapViewHolder;
        markerManager: MarkerManager<MapTilerActualMarker>;
        markerLayer: MarkerLayer;
        dragLayer: MarkerDragLayer;
    });
    onAdd(data: AddParams[]): Promise<(MapTilerActualMarker | null)[]>;
    onChange(data: ChangeParams<MapTilerActualMarker>[]): Promise<(MapTilerActualMarker | null)[]>;
    onRemove(data: MarkerEntity<MapTilerActualMarker>[]): Promise<void>;
    onPostProcess(): Promise<void>;
    setMarkerVisible(entity: MarkerEntity<MapTilerActualMarker>, visible: boolean): void;
    setMarkerPosition(entity: MarkerEntity<MapTilerActualMarker>, position: GeoPoint): void;
    updateSelectedMarker({ entity, state, bitmapIcon, }: {
        entity: MarkerEntity<MapTilerActualMarker>;
        state: MarkerState;
        bitmapIcon: BitmapIcon;
    }): Promise<void>;
    drawDragLayer(): void;
    redraw(): void;
    resync(): Promise<void>;
    private createMarkerFeature;
    private retainIcon;
    private releaseIcon;
    private customIconKey;
    private ensureImages;
    private ensureImage;
    private loadBitmapIcon;
    private ensureFallbackDefaultIcon;
    private removeUnusedImages;
    private syncIconOffsets;
    buildEntity(marker: MapTilerActualMarker, state: MarkerState): MarkerEntity<MapTilerActualMarker>;
}

declare class MapTilerMarkerController extends AbstractMarkerController<MapTilerActualMarker> {
    private readonly holder;
    readonly renderer: MapTilerMarkerOverlayRenderer;
    private selected;
    private pendingSelectedPosition;
    private selectedPositionFrame;
    private readonly tilingOptions;
    private tileRenderer;
    private tileRouteId;
    private tileVersion;
    private tileGeneration;
    /** Called by MapTilerViewController when RasterLayerState changes. */
    onRasterLayerUpdate: ((state: RasterLayerState | null) => Promise<void>) | null;
    constructor(holder: MapTilerMapViewHolder, renderer: MapTilerMarkerOverlayRenderer, tilingOptions?: MarkerTilingOptions);
    protected shouldTile(state: MarkerState, totalCount: number): boolean;
    protected onTiledMarkersChanged(): Promise<void>;
    private syncTiledOverlay;
    private serviceWorkerTileTemplate;
    private localTileTemplate;
    private removeTileOverlay;
    composition(data: MarkerState[]): Promise<void>;
    find(position: GeoPoint): MarkerEntity<MapTilerActualMarker> | null;
    /**
     * Find the marker nearest to `position` at the given zoom level.
     * Handles both regular markers (icon-bounds check) and tiled markers (geographic radius).
     * Mirrors Android's `GoogleMapMarkerController.find(position, zoom)`.
     */
    findWithZoom(position: GeoPoint, zoom: number, pointerType: 'touch' | 'mouse'): MarkerEntity<MapTilerActualMarker> | null;
    update(state: MarkerState): Promise<void>;
    has(state: MarkerState): boolean;
    getSelectedMarker(): MarkerEntity<MapTilerActualMarker> | null;
    setSelectedMarker(entity: MarkerEntity<MapTilerActualMarker> | null): Promise<void>;
    updateSelectedPosition(position: GeoPoint): void;
    resync(): Promise<void>;
    clear(): Promise<void>;
    destroy(): void;
    private flushSelectedPosition;
    private cancelSelectedPositionFrame;
    private hasCompositionChanges;
}

declare class MapTilerMarkerEventController {
    private readonly controller;
    private activePointerId;
    private dragPanWasEnabled;
    private pointerDownOffset;
    private dragStarted;
    /** Last observed pointer input type — used by MapTilerViewController for tile-marker hit radius. */
    lastPointerType: 'touch' | 'mouse';
    constructor(controller: MapTilerMarkerController);
    resync(): void;
    setClickListener(listener: OnMarkerEventHandler | null): void;
    setDragStartListener(listener: OnMarkerEventHandler | null): void;
    setDragListener(listener: OnMarkerEventHandler | null): void;
    setDragEndListener(listener: OnMarkerEventHandler | null): void;
    setAnimateStartListener(listener: OnMarkerEventHandler | null): void;
    setAnimateEndListener(listener: OnMarkerEventHandler | null): void;
    destroy(): void;
    private readonly handlePointerDown;
    private readonly handlePointerMove;
    private readonly handlePointerUp;
    private readonly handlePointerCancel;
    private finishDrag;
    private restoreMapInteraction;
    private findMarkerAtPointer;
    private positionFromPointer;
    private localPoint;
}

type MapTilerActualCircle = PolygonFeature & {
    id?: string | number;
};
declare class MapTilerCircleLayer {
    static readonly Prop: {
        readonly FILL_COLOR: "fillColor";
        readonly STROKE_COLOR: "strokeColor";
        readonly STROKE_WIDTH: "strokeWidth";
        readonly Z_INDEX: "zIndex";
    };
    private readonly holder;
    private readonly canEditStyle;
    readonly sourceId: string;
    readonly layerId: string;
    readonly strokeLayerId: string;
    constructor({ holder, canEditStyle, sourceId, layerId, }: {
        holder: MapTilerMapViewHolder;
        canEditStyle: () => boolean;
        sourceId?: string;
        layerId?: string;
    });
    draw(entities: CircleEntity<MapTilerActualCircle>[]): boolean;
    private ensureStyleResources;
}

declare class MapTilerCircleOverlayRenderer extends AbstractCircleOverlayRenderer<MapTilerMapViewHolder, MapTilerActualCircle> {
    readonly layer: MapTilerCircleLayer;
    readonly circleManager: CircleManagerInterface<MapTilerActualCircle>;
    constructor({ layer, circleManager, holder, }: {
        layer: MapTilerCircleLayer;
        circleManager: CircleManagerInterface<MapTilerActualCircle>;
        holder: MapTilerMapViewHolder;
    });
    createCircle(state: CircleState): Promise<MapTilerActualCircle | null>;
    updateCircleProperties({ current, }: {
        circle: MapTilerActualCircle;
        current: CircleEntity<MapTilerActualCircle>;
        prev: CircleEntity<MapTilerActualCircle>;
    }): Promise<MapTilerActualCircle | null>;
    removeCircle(_entity: CircleEntity<MapTilerActualCircle>): Promise<void>;
    onPostProcess(): Promise<void>;
    redraw(): Promise<void>;
}

declare class MapTilerCircleController extends CircleController<MapTilerActualCircle> {
    readonly renderer: MapTilerCircleOverlayRenderer;
    constructor(renderer: MapTilerCircleOverlayRenderer);
    update(state: CircleState): Promise<void>;
    resync(): Promise<void>;
    clear(): Promise<void>;
    /**
     * Hit-test a map click (its lat/lng) against the circles geometrically (inside
     * the fill radius) and dispatch the click on the matching circle. Does NOT use
     * a MapTiler layer/overlay click event — detection is driven by the map click
     * position, matching the marker/polyline paths and android. Returns true if hit.
     */
    handleMapClick(clicked: GeoPoint): boolean;
}

type MapTilerActualPolyline = LineFeature[];
declare class MapTilerPolylineLayer {
    static readonly Prop: {
        readonly STROKE_COLOR: "strokeColor";
        readonly STROKE_WIDTH: "strokeWidth";
        readonly Z_INDEX: "zIndex";
    };
    private readonly holder;
    private readonly canEditStyle;
    readonly sourceId: string;
    readonly layerId: string;
    constructor({ holder, canEditStyle, sourceId, layerId, }: {
        holder: MapTilerMapViewHolder;
        canEditStyle: () => boolean;
        sourceId?: string;
        layerId?: string;
    });
    draw(entities: PolylineEntity<MapTilerActualPolyline>[]): boolean;
    private ensureStyleResources;
}

declare class MapTilerPolylineOverlayRenderer extends AbstractPolylineOverlayRenderer<MapTilerMapViewHolder, MapTilerActualPolyline> {
    readonly layer: MapTilerPolylineLayer;
    readonly polylineManager: PolylineManagerInterface<MapTilerActualPolyline>;
    constructor({ layer, polylineManager, holder, }: {
        layer: MapTilerPolylineLayer;
        polylineManager: PolylineManagerInterface<MapTilerActualPolyline>;
        holder: MapTilerMapViewHolder;
    });
    createPolyline(state: PolylineState): Promise<MapTilerActualPolyline | null>;
    updatePolylineProperties({ current, }: {
        polyline: MapTilerActualPolyline;
        current: PolylineEntity<MapTilerActualPolyline>;
        prev: PolylineEntity<MapTilerActualPolyline>;
    }): Promise<MapTilerActualPolyline | null>;
    removePolyline(_entity: PolylineEntity<MapTilerActualPolyline>): Promise<void>;
    onPostProcess(): Promise<void>;
    redraw(): Promise<void>;
    private resolveZIndex;
}

declare class MapTilerPolylineController extends PolylineController<MapTilerActualPolyline> {
    readonly renderer: MapTilerPolylineOverlayRenderer;
    constructor(renderer: MapTilerPolylineOverlayRenderer);
    resync(): Promise<void>;
    clear(): Promise<void>;
    /**
     * Hit-test a map click (its lat/lng) against the polylines geometrically and,
     * if the click lands within the tap tolerance of a line, dispatch the click on
     * the nearest polyline (with the closest point on that line as `clicked`).
     *
     * This intentionally does NOT use a MapTiler layer/overlay click event. Like
     * android (`TomTomMapViewController.onPolylineClickedInternal`) and the marker
     * path, the hit is derived from the map click position, so behaviour matches
     * across providers. Returns true if a polyline was hit (so the caller can
     * suppress the generic map click).
     */
    handleMapClick(clicked: GeoPoint, camera: MapCameraPosition | null): boolean;
}

interface MapTilerActualPolygon {
    readonly fillFeatures: PolygonFeature[];
    readonly outlineFeatures: LineFeature[];
}
declare class MapTilerPolygonLayer {
    static readonly Prop: {
        readonly FILL_COLOR: "fillColor";
        readonly STROKE_COLOR: "strokeColor";
        readonly STROKE_WIDTH: "strokeWidth";
        readonly Z_INDEX: "zIndex";
    };
    private readonly holder;
    private readonly canEditStyle;
    readonly sourceId: string;
    readonly layerId: string;
    readonly outlineSourceId: string;
    readonly outlineLayerId: string;
    constructor({ holder, canEditStyle, sourceId, layerId, outlineSourceId, outlineLayerId, }: {
        holder: MapTilerMapViewHolder;
        canEditStyle: () => boolean;
        sourceId?: string;
        layerId?: string;
        outlineSourceId?: string;
        outlineLayerId?: string;
    });
    draw(entities: PolygonEntity<MapTilerActualPolygon>[]): boolean;
    private ensureStyleResources;
}

declare class MapTilerPolygonOverlayRenderer extends AbstractPolygonOverlayRenderer<MapTilerMapViewHolder, MapTilerActualPolygon> {
    readonly layer: MapTilerPolygonLayer;
    readonly polygonManager: PolygonManagerInterface<MapTilerActualPolygon>;
    constructor({ layer, polygonManager, holder, }: {
        layer: MapTilerPolygonLayer;
        polygonManager: PolygonManagerInterface<MapTilerActualPolygon>;
        holder: MapTilerMapViewHolder;
    });
    createPolygon(state: PolygonState): Promise<MapTilerActualPolygon | null>;
    updatePolygonProperties({ current, }: {
        polygon: MapTilerActualPolygon;
        current: PolygonEntity<MapTilerActualPolygon>;
        prev: PolygonEntity<MapTilerActualPolygon>;
    }): Promise<MapTilerActualPolygon | null>;
    removePolygon(_entity: PolygonEntity<MapTilerActualPolygon>): Promise<void>;
    onPostProcess(): Promise<void>;
}

declare class MapTilerPolygonConductor {
    readonly polygonOverlay: MapTilerPolygonOverlayRenderer;
    clickListener: OnPolygonEventHandler | null;
    private operation;
    constructor(polygonOverlay: MapTilerPolygonOverlayRenderer);
    composition(data: PolygonState[]): Promise<void>;
    update(state: PolygonState): Promise<void>;
    has(state: PolygonState): boolean;
    resync(): Promise<void>;
    clear(): Promise<void>;
    private redraw;
    /**
     * Hit-test a map click (its lat/lng) against the polygons geometrically
     * (point-in-polygon, honouring holes and zIndex) and dispatch the click on the
     * top-most polygon that contains the point. Does NOT use a MapTiler
     * layer/overlay click event — detection is driven by the map click position,
     * matching the marker/polyline paths and android. Returns true if hit.
     */
    handleMapClick(clicked: GeoPoint): boolean;
    private enqueue;
}

declare class MapTilerGroundImageOverlayRenderer extends AbstractGroundImageOverlayRenderer<MapTilerMapViewHolder, string> {
    private readonly canEditStyle;
    /** Last values applied to the map style, keyed by state id. */
    private readonly applied;
    constructor({ holder, canEditStyle, }: {
        holder: MapTilerMapViewHolder;
        canEditStyle: () => boolean;
    });
    sourceId(id: string): string;
    layerId(id: string): string;
    createGroundImage(state: GroundImageState): Promise<string | null>;
    updateGroundImageProperties({ current, }: {
        groundImage: string;
        current: GroundImageEntity<string>;
        prev: GroundImageEntity<string>;
    }): Promise<string | null>;
    /** Sync an already-created image source+layer to the current state (diffed). */
    private applyToExisting;
    removeGroundImage(entity: GroundImageEntity<string>): Promise<void>;
}

declare class MapTilerGroundImageController {
    private readonly groundImageStates;
    private readonly groundImageIds;
    private readonly pendingUpdates;
    private readonly renderer;
    private updateFrame;
    constructor(renderer: MapTilerGroundImageOverlayRenderer);
    composition(data: GroundImageState[]): void;
    update(state: GroundImageState): void;
    has(state: GroundImageState): boolean;
    hasClickableAt(point: GeoPoint): boolean;
    dispatchClick(point: GeoPoint): boolean;
    resync(): void;
    clear(): void;
    private cancelPendingUpdates;
    private upsert;
    private removeById;
}

/** GL のソース／レイヤー ID の対。android-sdk の MapTilerRasterLayerHandle と同一。 */
interface MapTilerRasterLayerHandle {
    readonly sourceId: string;
    readonly layerId: string;
}
/**
 * android-sdk と同じく汎用 RasterLayerController が駆動する OverlayRenderer 実装。
 * onAdd/onChange/onRemove でネイティブ GL のソース・レイヤーを操作する。スタイルが
 * まだ編集できない場合はハンドルだけ返し、スタイル (再)読み込み後に controller.resync()
 * で貼り直す。
 */
declare class MapTilerRasterLayerOverlayRenderer implements RasterLayerOverlayRenderer<MapTilerRasterLayerHandle> {
    readonly holder: MapTilerMapViewHolder;
    private readonly canEditStyle;
    constructor(holder: MapTilerMapViewHolder, canEditStyle: () => boolean);
    private sourceId;
    private layerId;
    onAdd(data: RasterLayerAddParams[]): Promise<(MapTilerRasterLayerHandle | null)[]>;
    onChange(data: RasterLayerChangeParams<MapTilerRasterLayerHandle>[]): Promise<(MapTilerRasterLayerHandle | null)[]>;
    onRemove(data: RasterLayerEntity<MapTilerRasterLayerHandle>[]): Promise<void>;
    onCameraChanged(_mapCameraPosition: MapCameraPosition): Promise<void>;
    onPostProcess(): Promise<void>;
    private addLayer;
    private updateLayer;
    private removeLayer;
}

/**
 * android-sdk の MapTilerRasterLayerController と同じく汎用 RasterLayerController の薄い
 * サブクラス。composition/update/has/clear は基底クラスが提供する。GL スタイルが
 * 再読み込みされると既存のソース・レイヤーは失われるため、resync() で登録済みの
 * ラスターレイヤーを貼り直す（android-sdk の reapplyStyle 相当）。
 */
declare class MapTilerRasterLayerController extends RasterLayerController<MapTilerRasterLayerHandle> {
    /**
     * MapTiler の web SDK は maplibre-gl なので MapLibre と同じ transformRequest 経路。
     * android の MapTiler は WebView なので載せられない（プラットフォームで事情が違う）。
     *
     * userAgent はブラウザが上書きを許さないので、どのプロバイダでも web では効かない。
     */
    protected get headerSupport(): RasterHeaderSupport;
    constructor(renderer: MapTilerRasterLayerOverlayRenderer);
    resync(): Promise<void>;
}

declare class MapTilerViewController extends BaseMapViewController implements MapViewControllerInterface, MarkerCapable, CircleCapable, PolylineCapable, PolygonCapable, GroundImageCapable, RasterLayerCapable {
    private readonly mapInstance;
    private initialized;
    private logicalTiltHint;
    private readonly styleReadyRef;
    /** 現在の投影法。android-sdk の MapboxMapViewController の projection と同じ役割。 */
    private projection;
    readonly holder: MapTilerMapViewHolder;
    private readonly markerController;
    private readonly markerEventController;
    private readonly circleController;
    private readonly polylineController;
    private readonly polygonController;
    private readonly groundImageController;
    private readonly rasterLayerController;
    constructor(holder: MapTilerMapViewHolder, markerController: MapTilerMarkerController, markerEventController: MapTilerMarkerEventController, circleController: MapTilerCircleController, polylineController: MapTilerPolylineController, polygonController: MapTilerPolygonConductor, groundImageController: MapTilerGroundImageController, rasterLayerController: MapTilerRasterLayerController, styleReadyRef?: {
        current: boolean;
    }, logicalTiltHint?: number | null, projection?: MapProjection);
    getMap(): maplibregl.Map;
    /**
     * 投影法を切り替える。android-sdk の `MapboxMapViewController.setProjection` /
     * ios-sdk の `Coordinator.setProjection` と同じく、同値なら何もしない。
     * maplibre-gl は mapbox-gl と違い `{ type }` を受け取る。
     */
    setProjection(projection: MapProjection): void;
    applyUISettings(settings: MapUISettings): void;
    private setupEventListeners;
    setMapInitializedListener(listener: OnMapInitializedHandler | null): void;
    moveCamera(position: MapCameraPosition): Promise<boolean>;
    animateCamera(position: MapCameraPosition, durationMillis: number): Promise<boolean>;
    fitBounds(bounds: GeoRectBounds, padding: number): Promise<boolean>;
    getCameraPosition(): MapCameraPosition | null;
    compositionMarkers(data: MarkerState[]): Promise<void>;
    updateMarker(state: MarkerState): Promise<void>;
    hasMarker(state: MarkerState): boolean;
    setOnMarkerClickListener(_listener: OnMarkerEventHandler | null): void;
    setOnMarkerDragStart(_listener: OnMarkerEventHandler | null): void;
    setOnMarkerDrag(_listener: OnMarkerEventHandler | null): void;
    setOnMarkerDragEnd(_listener: OnMarkerEventHandler | null): void;
    setOnMarkerAnimateStart(_listener: OnMarkerEventHandler | null): void;
    setOnMarkerAnimateEnd(_listener: OnMarkerEventHandler | null): void;
    setMarkerAnimationOverlayHost(host: MarkerAnimationOverlayHost | null): void;
    compositionCircles(data: CircleState[]): Promise<void>;
    updateCircle(state: CircleState): Promise<void>;
    hasCircle(state: CircleState): boolean;
    setOnCircleClickListener(_listener: OnCircleEventHandler | null): void;
    compositionPolylines(data: PolylineState[]): Promise<void>;
    updatePolyline(state: PolylineState): Promise<void>;
    hasPolyline(state: PolylineState): boolean;
    setOnPolylineClickListener(_listener: OnPolylineEventHandler | null): void;
    compositionPolygons(data: PolygonState[]): Promise<void>;
    updatePolygon(state: PolygonState): Promise<void>;
    hasPolygon(state: PolygonState): boolean;
    setOnPolygonClickListener(_listener: OnPolygonEventHandler | null): void;
    compositionGroundImages(data: GroundImageState[]): Promise<void>;
    updateGroundImage(state: GroundImageState): Promise<void>;
    hasGroundImage(state: GroundImageState): boolean;
    setOnGroundImageClickListener(_listener: OnGroundImageEventHandler | null): void;
    compositionRasterLayers(data: RasterLayerState[]): Promise<void>;
    updateRasterLayer(state: RasterLayerState): Promise<void>;
    hasRasterLayer(state: RasterLayerState): boolean;
    clearOverlays(): Promise<void>;
    /**
     * MapTiler は MapLibre GL ベースでネイティブの範囲制限 API を持つので、
     * `BaseMapViewController` のクランプ方式ではなく直接適用する。
     * android-sdk の同名メソッドと同じ方針。
     */
    setCameraRestriction(restriction: CameraRestriction | null): void;
    destroy(): void;
}

interface MapTilerMapDesignType extends MapDesignTypeInterface<string> {
    /** MapTiler Cloud map id (e.g. 'streets-v2', 'satellite'). */
    readonly styleId: string;
}
/**
 * MapTiler map design (a MapTiler Cloud reference style).
 *
 * `id` / `getValue()` is the stable key (used for save/restore and as the map
 * re-init trigger); the value actually loaded is the MapTiler style.json for
 * [styleId], resolved with the view state's API key. Mirrors android
 * `MapTilerDesign` (Streets / StreetsDark / Satellite / …) one-to-one.
 */
declare class MapTilerDesign implements MapTilerMapDesignType {
    readonly id: string;
    readonly styleId: string;
    readonly attributionRules: readonly AttributionRule[];
    constructor(id: string, styleId: string, attributionRules?: readonly AttributionRule[]);
    getValue(): string;
    static readonly Streets: MapTilerDesign;
    static readonly StreetsDark: MapTilerDesign;
    static readonly StreetsLight: MapTilerDesign;
    static readonly Basic: MapTilerDesign;
    static readonly Bright: MapTilerDesign;
    static readonly Satellite: MapTilerDesign;
    static readonly Outdoor: MapTilerDesign;
    static readonly Winter: MapTilerDesign;
    static readonly Topo: MapTilerDesign;
    static readonly Toner: MapTilerDesign;
    static readonly Dataviz: MapTilerDesign;
    static readonly Backdrop: MapTilerDesign;
    static readonly Ocean: MapTilerDesign;
    static readonly Landscape: MapTilerDesign;
    static readonly Aquarelle: MapTilerDesign;
    static readonly OpenStreetMap: MapTilerDesign;
}

interface MapTilerViewStateInterface extends MapViewStateInterface<MapTilerMapDesignType> {
    /** MapTiler Cloud API key used to load the style/tiles. */
    readonly apiKey: string;
}
interface MapTilerViewStateParams {
    id?: string;
    /** MapTiler Cloud API key. Required for the map/tiles to load. */
    apiKey?: string;
    mapDesignType?: MapTilerMapDesignType;
    cameraPosition?: MapCameraPosition;
}
declare class MapTilerViewState extends MapViewState<MapTilerMapDesignType> implements MapTilerViewStateInterface {
    readonly id: string;
    readonly apiKey: string;
    private _cameraPosition;
    private _mapDesignType;
    private _controller;
    private _cameraPositionChangeListener;
    constructor({ id, apiKey, mapDesignType, cameraPosition, }?: MapTilerViewStateParams);
    get cameraPosition(): MapCameraPosition;
    get mapDesignType(): MapTilerMapDesignType;
    set mapDesignType(value: MapTilerMapDesignType);
    moveCameraTo(position: GeoPoint, durationMillis?: number): void;
    moveCameraTo(cameraPosition: MapCameraPosition, durationMillis?: number): void;
    getMapViewHolder(): MapViewHolder<unknown, unknown> | null;
    fitBounds(bounds: GeoRectBounds, padding?: number): void;
    setController(ctrl: MapViewControllerInterface | null): void;
    updateCameraPosition(camera: MapCameraPosition): void;
    setCameraPositionChangeListener(listener: ((camera: MapCameraPosition) => void) | null): void;
    private resolveCameraPosition;
}
declare function useMapTilerViewState(params?: MapTilerViewStateParams): MapTilerViewStateInterface;

interface MapTilerMapViewProps extends MapViewBaseProps<MapTilerViewStateInterface> {
    maxZoom?: number;
    minZoom?: number;
    /** Restricts panning/zooming so the viewport cannot leave this rectangle. */
    restrictBounds?: GeoRectBounds;
    containerStyle?: React.CSSProperties;
    onError?: (error: Error) => void;
    children?: React.ReactNode;
    markerTilingOptions?: MarkerTilingOptions;
    /**
     * 投影法。省略時は 3D 版が Globe、2D 版が Mercator。
     * android-sdk / ios-sdk の `projection: MapProjection` と同じ役割で、
     * 変更すると実行時に切り替わる。
     */
    projection?: MapProjection;
}
declare function MapTilerMapView(props: MapTilerMapViewProps): React.JSX.Element;
declare function MapTilerMapView2D(props: MapTilerMapViewProps): React.JSX.Element;

/**
 * 統一ズーム（Google Maps 基準・256px タイル）⇄ 高度の変換。
 *
 * MapTiler は MapLibre と同じ 512px タイルのベクタエンジンなので、統一ズームはネイティブズーム + 1。
 * 換算式はコアの {@link WebMercatorZoomAltitudeConverter} にある。
 */
declare class ZoomAltitudeConverter extends WebMercatorZoomAltitudeConverter {
    /** Empirical offset: GoogleZoom ≈ MapTilerSDK.zoom + 1.0 */
    static readonly MAPLIBRE_TO_GOOGLE_ZOOM_OFFSET = 1;
    constructor(zoom0Altitude?: number);
    static maplibreZoomToGoogleZoom(maplibreZoom: number): number;
    static googleZoomToMaplibreZoom(googleZoom: number): number;
}

export { type MapTilerConfig, MapTilerDesign, type MapTilerMapDesignType, MapTilerMapView, MapTilerMapView2D, type MapTilerMapViewProps, MapTilerProvider, MapTilerViewController, MapTilerViewState, type MapTilerViewStateInterface, ZoomAltitudeConverter, useMapTilerViewState };
