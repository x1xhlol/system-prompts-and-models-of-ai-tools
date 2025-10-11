import { warn } from '@algolia/autocomplete-shared';
export function checkOptions(options) {
  process.env.NODE_ENV !== 'production' ? warn(!options.debug, 'The `debug` option is meant for development debugging and should not be used in production.') : void 0;
}