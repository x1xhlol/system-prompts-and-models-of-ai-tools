let _emitDeprecation = 3;
let _emitError = false;
function enableDeprecationWarnings(emitDeprecation = true, emitError = false) {
  _emitDeprecation = emitDeprecation;
  _emitError = emitError;
}
function warnDeprecated(message, version = 3) {
  if (!_emitDeprecation)
    return;
  if (typeof _emitDeprecation === "number" && version > _emitDeprecation)
    return;
  if (_emitError) {
    throw new Error(`[SHIKI DEPRECATE]: ${message}`);
  } else {
    console.trace(`[SHIKI DEPRECATE]: ${message}`);
  }
}

export { enableDeprecationWarnings as e, warnDeprecated as w };
