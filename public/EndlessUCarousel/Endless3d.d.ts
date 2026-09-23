export interface Endless3dProps {
  /**
   * Media
   */
  media?: unknown[];
  /**
   * Interaction
   */
  interaction?: Record<string, unknown>;
  /**
   * Carousel Bounds — pass as `carousel` not `carouselBounds`.
   */
  carousel?: Record<string, unknown>;
  /**
   * Perspective Base — pass as `layout` not `perspectiveBase`.
   */
  layout?: Record<string, unknown>;
  /**
   * Environment — pass as `styleGroup` not `environment`.
   */
  styleGroup?: Record<string, unknown>;
  /** Additional properties */
  [key: string]: unknown;
}
