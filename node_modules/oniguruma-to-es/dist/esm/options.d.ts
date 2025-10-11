export namespace Accuracy {
    let _default: "default";
    export { _default as default };
    export let strict: "strict";
}
export namespace EsVersion {
    let ES2025: number;
    let ES2024: number;
    let ES2018: number;
}
/**
Returns a complete set of options, with default values set for options that weren't provided.
@param {import('.').ToRegExpOptions} [options]
@returns {Required<import('.').ToRegExpOptions>}
*/
export function getOptions(options?: import(".").ToRegExpOptions): Required<import(".").ToRegExpOptions>;
export namespace Target {
    export let auto: "auto";
    let ES2025_1: "ES2025";
    export { ES2025_1 as ES2025 };
    let ES2024_1: "ES2024";
    export { ES2024_1 as ES2024 };
    let ES2018_1: "ES2018";
    export { ES2018_1 as ES2018 };
}
