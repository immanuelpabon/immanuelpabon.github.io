import type { Comp } from "../../types";
/**
 * The {@link layer `layer()`} component.
 *
 * @group Component Types
 */
export interface LayerComp extends Comp {
    get layerIndex(): number;
    /**
     * Get the name of the current layer the object is assigned to.
     */
    get layer(): string;
    /**
     * Set the name of the layer the object should be assigned to.
     */
    set layer(name: string);
}
export declare function layer(layer: string): LayerComp;
//# sourceMappingURL=layer.d.ts.map