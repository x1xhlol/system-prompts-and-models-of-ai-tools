type Options = {
    props?: (string | symbol)[];
    nonenumerable?: boolean;
};
/**
 * Copy (clone) an object and all its props recursively to get rid of any prop referenced of the original object. Arrays are also cloned, however objects inside arrays are still linked.
 *
 * @param target Target can be anything
 * @param [options = {}] Options can be `props` or `nonenumerable`
 * @returns the target with replaced values
 */
declare function copy<T>(target: T, options?: Options): T;

export { Options, copy };
