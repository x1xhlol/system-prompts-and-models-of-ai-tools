export class DefinedInfo extends Info {
    /**
     * @constructor
     * @param {string} property
     *   Property.
     * @param {string} attribute
     *   Attribute.
     * @param {number | null | undefined} [mask]
     *   Mask.
     * @param {Space | undefined} [space]
     *   Space.
     * @returns
     *   Info.
     */
    constructor(property: string, attribute: string, mask?: number | null | undefined, space?: Space | undefined);
}
import { Info } from './info.js';
import type { Space } from 'property-information';
//# sourceMappingURL=defined-info.d.ts.map