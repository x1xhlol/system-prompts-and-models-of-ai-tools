import type {VFile} from './lib/index.js'

// See: <https://github.com/sindresorhus/type-fest/blob/main/source/empty-object.d.ts>
declare const emptyObjectSymbol: unique symbol

// To do: next major: remove.
export type {Options as MessageOptions} from 'vfile-message'

export {VFile} from './lib/index.js'

// To do: next major: remove.
// Deprecated names (w/ prefix):
export type {
  Compatible as VFileCompatible,
  DataMap as VFileDataMap,
  Data as VFileData,
  Options as VFileOptions,
  ReporterSettings as VFileReporterSettings,
  Reporter as VFileReporter,
  Value as VFileValue
}

/**
 * Things that can be passed to the constructor.
 */
export type Compatible = Options | URL | VFile | Value

/**
 * Raw source map.
 *
 * See:
 * <https://github.com/mozilla/source-map/blob/60adcb0/source-map.d.ts#L15-L23>.
 */
export interface Map {
  /**
   * The generated file this source map is associated with.
   */
  file: string
  /**
   * A string of base64 VLQs which contain the actual mappings.
   */
  mappings: string
  /**
   * An array of identifiers which can be referenced by individual mappings.
   */
  names: Array<string>
  /**
   * An array of contents of the original source files.
   */
  sourcesContent?: Array<string> | undefined
  /**
   * The URL root from which all sources are relative.
   */
  sourceRoot?: string | undefined
  /**
   * An array of URLs to the original source files.
   */
  sources: Array<string>
  /**
   * Which version of the source map spec this map is following.
   */
  version: number
}

/**
 * This map registers the type of the `data` key of a `VFile`.
 *
 * This type can be augmented to register custom `data` types.
 *
 * @example
 * declare module 'vfile' {
 *   interface DataMap {
 *     // `file.data.name` is typed as `string`
 *     name: string
 *   }
 * }
 */
export interface DataMap {
  [emptyObjectSymbol]?: never
}

/**
 * Custom info.
 *
 * Known attributes can be added to {@linkcode DataMap}
 */
export type Data = Record<string, unknown> & Partial<DataMap>

/**
 * Configuration.
 */
export interface Options {
  /**
   * Arbitrary fields that will be shallow copied over to the new file.
   */
  [key: string]: unknown
  /**
   * Set `basename` (name).
   */
  basename?: string | null | undefined
  /**
   * Set `cwd` (working directory).
   */
  cwd?: string | null | undefined
  /**
   * Set `data` (associated info).
   */
  data?: Data | null | undefined
  /**
   * Set `dirname` (path w/o basename).
   */
  dirname?: string | null | undefined
  /**
   * Set `extname` (extension with dot).
   */
  extname?: string | null | undefined
  /**
   * Set `history` (paths the file moved between).
   */
  history?: Array<string> | null | undefined
  /**
   * Set `path` (current path).
   */
  path?: URL | string | null | undefined
  /**
   * Set `stem` (name without extension).
   */
  stem?: string | null | undefined
  /**
   * Set `value` (the contents of the file).
   */
  value?: Value | null | undefined
}

/**
 * Configuration for reporters.
 */
export type ReporterSettings = Record<string, unknown>

/**
 * Type for a reporter.
 */
export type Reporter<Settings = ReporterSettings> = (
  files: Array<VFile>,
  options: Settings
) => string

/**
 * Contents of the file.
 *
 * Can either be text or a `Uint8Array` structure.
 */
export type Value = Uint8Array | string
