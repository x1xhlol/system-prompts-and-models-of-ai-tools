/**
 * Interface for the SpeakingURL options
 * @see {@link https://github.com/pid/speakingurl#usage}
 */
interface speakingurlOptions {
    /**
    * Character that replaces the whitespaces
    *  @default '-'
    */
    separator?: string;
    /**
    * ISO 639-1 Codes for language specific transliteration
    *  @default 'en'
    */
    lang?: string | boolean;

    /**
    * Converts symbols according to the 'lang' setting if true. Don't convert symbols if false
    *  @default true
    */
    symbols?: boolean;


    /**
    * Maintains case chars if true. Convert all chars to lower case if false
    *  @default false
    */
    maintainCase?: boolean;


    /**
    * converts input string to title-case if true. Omit the words from the array if array is given.
    *  @default false
    */
    titleCase?: boolean | Array<string>;


    /**
    * Don't trim length if 0. Trim to max length while not breaking any words if greater or equal to 1.
    *  @default 0
    */
    truncate?: number;


    /**
    *  Allow additional characters if true.
    *  Characters allowed: ";", "?", ":", "@", "&", "=", "+", "\$", ",", "/"
    *  @default false
    */
    uric?: boolean;


    /**
    *  Allow additional characters if true.
    *  Characters allowed: ";", "?", ":", "@", "&", "=", "+", "\$", ","
    *  @default false
    */
    uricNoSlash?: boolean;


    /**
    *  Allow additional characters if true.
    *  Characters allowed: "-", "_", ".", "!", "~", "*", "'", "(", ")"
    *  @default false
    */
    mark?: boolean;


    /**
    *  custom map for translation if object provided. Add array chars to allowed charMap if array provided.
    *  @default {}
    */
    custom?: Object | Array<string>

}


/**
 * Determines slug from given input.
 * @param {string} input string to convert
 * @param {object|string} options configuration object or separator string
 * @return {string} slug
 */
declare function getSlug(input: string, options?: speakingurlOptions | string): string;

/**
 * @function createSlug
 * @param {object|string} options configuration object or separator string
 */
declare function createSlug(options?: speakingurlOptions | string): ((input: string) => string);
