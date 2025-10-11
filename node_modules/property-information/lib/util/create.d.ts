/**
 * @param {Definition} definition
 *   Definition.
 * @returns {Schema}
 *   Schema.
 */
export function create(definition: Definition): Schema;
/**
 * Definition of a schema.
 */
export type Definition = {
    /**
     * Normalzed names to special attribute case.
     */
    attributes?: Record<string, string> | undefined;
    /**
     * Normalized names that must be set as properties.
     */
    mustUseProperty?: ReadonlyArray<string> | undefined;
    /**
     *   Property names to their types.
     */
    properties: Record<string, number | null>;
    /**
     * Space.
     */
    space?: Space | undefined;
    /**
     *   Transform a property name.
     */
    transform: Transform;
};
/**
 * Transform.
 */
export type Transform = (attributes: Record<string, string>, property: string) => string;
import { Schema } from './schema.js';
import type { Space } from 'property-information';
//# sourceMappingURL=create.d.ts.map