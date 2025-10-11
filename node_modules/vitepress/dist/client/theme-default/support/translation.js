import { useData } from '../composables/data';
/**
 * @param themeObject Can be an object with `translations` and `locales` properties
 */
export function createSearchTranslate(defaultTranslations) {
    const { localeIndex, theme } = useData();
    function translate(key) {
        const keyPath = key.split('.');
        const themeObject = theme.value.search?.options;
        const isObject = themeObject && typeof themeObject === 'object';
        const locales = (isObject && themeObject.locales?.[localeIndex.value]?.translations) ||
            null;
        const translations = (isObject && themeObject.translations) || null;
        let localeResult = locales;
        let translationResult = translations;
        let defaultResult = defaultTranslations;
        const lastKey = keyPath.pop();
        for (const k of keyPath) {
            let fallbackResult = null;
            const foundInFallback = defaultResult?.[k];
            if (foundInFallback) {
                fallbackResult = defaultResult = foundInFallback;
            }
            const foundInTranslation = translationResult?.[k];
            if (foundInTranslation) {
                fallbackResult = translationResult = foundInTranslation;
            }
            const foundInLocale = localeResult?.[k];
            if (foundInLocale) {
                fallbackResult = localeResult = foundInLocale;
            }
            // Put fallback into unresolved results
            if (!foundInFallback) {
                defaultResult = fallbackResult;
            }
            if (!foundInTranslation) {
                translationResult = fallbackResult;
            }
            if (!foundInLocale) {
                localeResult = fallbackResult;
            }
        }
        return (localeResult?.[lastKey] ??
            translationResult?.[lastKey] ??
            defaultResult?.[lastKey] ??
            '');
    }
    return translate;
}
