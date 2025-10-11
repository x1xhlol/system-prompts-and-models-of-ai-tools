/**
 * @import {Info as InfoType} from 'property-information'
 */
/** @type {InfoType} */
export class Info {
    /**
     * @param {string} property
     *   Property.
     * @param {string} attribute
     *   Attribute.
     * @returns
     *   Info.
     */
    constructor(property: string, attribute: string);
    attribute: string;
    property: string;
    booleanish: boolean;
    boolean: boolean;
    commaOrSpaceSeparated: boolean;
    commaSeparated: boolean;
    defined: boolean;
    mustUseProperty: boolean;
    number: boolean;
    overloadedBoolean: boolean;
    spaceSeparated: boolean;
    space: import("property-information").Space | undefined;
}
//# sourceMappingURL=info.d.ts.map