import { Color } from "../../math";
import type { Comp, LineCap, LineJoin, Outline } from "../../types";
/**
 * The {@link outline `outline()`} component.
 *
 * @group Component Types
 */
export interface OutlineComp extends Comp {
    outline: Outline;
}
export declare function outline(width?: number, color?: Color, opacity?: number, join?: LineJoin, miterLimit?: number, cap?: LineCap): OutlineComp;
//# sourceMappingURL=outline.d.ts.map