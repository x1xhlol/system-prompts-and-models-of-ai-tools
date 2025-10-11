/**
 * Safely runs code meant for browser environments only.
 */
export function safelyRunOnBrowser(callback) {
  if (typeof window !== 'undefined') {
    return callback({
      window: window
    });
  }
  return undefined;
}