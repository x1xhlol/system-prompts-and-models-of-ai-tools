/**
 * @import {Schema as SchemaType, Space} from 'property-information'
 */
/** @type {SchemaType} */
export class Schema {
    /**
     * @param {SchemaType['property']} property
     *   Property.
     * @param {SchemaType['normal']} normal
     *   Normal.
     * @param {Space | undefined} [space]
     *   Space.
     * @returns
     *   Schema.
     */
    constructor(property: SchemaType["property"], normal: SchemaType["normal"], space?: Space | undefined);
    normal: Record<string, string>;
    property: Record<string, import("property-information").Info>;
    space: Space | undefined;
}
import type { Space } from 'property-information';
import type { Schema as SchemaType } from 'property-information';
//# sourceMappingURL=schema.d.ts.map