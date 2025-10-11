export var warnCache = {
  current: {}
};

/**
 * Logs a warning if the condition is not met.
 * This is used to log issues in development environment only.
 */
export function warn(condition, message) {
  if (!(process.env.NODE_ENV !== 'production')) {
    return;
  }
  if (condition) {
    return;
  }
  var sanitizedMessage = message.trim();
  var hasAlreadyPrinted = warnCache.current[sanitizedMessage];
  if (!hasAlreadyPrinted) {
    warnCache.current[sanitizedMessage] = true;

    // eslint-disable-next-line no-console
    console.warn("[Autocomplete] ".concat(sanitizedMessage));
  }
}