/**
 * Handle values based on a field.
 *
 * @template {InvalidHandler} [Invalid=InvalidHandler]
 * @template {UnknownHandler} [Unknown=UnknownHandler]
 * @template {Record<string, Handler>} [Handlers=Record<string, Handler>]
 * @param {string} key
 *   Field to switch on.
 * @param {Options<Invalid, Unknown, Handlers>} [options]
 *   Configuration (required).
 * @returns {{unknown: Unknown, invalid: Invalid, handlers: Handlers, (...parameters: Parameters<Handlers[keyof Handlers]>): ReturnType<Handlers[keyof Handlers]>, (...parameters: Parameters<Unknown>): ReturnType<Unknown>}}
 */
export function zwitch<
  Invalid extends InvalidHandler = InvalidHandler,
  Unknown extends UnknownHandler = UnknownHandler,
  Handlers extends Record<string, Handler> = Record<string, Handler>
>(
  key: string,
  options?: Options<Invalid, Unknown, Handlers> | undefined
): {
  (...parameters: Parameters<Handlers[keyof Handlers]>): ReturnType<
    Handlers[keyof Handlers]
  >
  (...parameters: Parameters<Unknown>): ReturnType<Unknown>
  unknown: Unknown
  invalid: Invalid
  handlers: Handlers
}
/**
 * Handle a value, with a certain ID field set to a certain value.
 * The ID field is passed to `zwitch`, and it’s value is this function’s
 * place on the `handlers` record.
 */
export type Handler = (...parameters: any[]) => any
/**
 * Handle values that do have a certain ID field, but it’s set to a value
 * that is not listed in the `handlers` record.
 */
export type UnknownHandler = (value: unknown, ...rest: any[]) => any
/**
 * Handle values that do not have a certain ID field.
 */
export type InvalidHandler = (
  value: unknown,
  ...rest: any[]
) => void | null | undefined | never
/**
 * Configuration (required).
 */
export type Options<
  Invalid extends InvalidHandler = InvalidHandler,
  Unknown extends UnknownHandler = UnknownHandler,
  Handlers extends Record<string, Handler> = Record<string, Handler>
> = {
  /**
   * Handler to use for invalid values.
   */
  invalid?: Invalid | undefined
  /**
   * Handler to use for unknown values.
   */
  unknown?: Unknown | undefined
  /**
   * Handlers to use.
   */
  handlers?: Handlers | undefined
}
