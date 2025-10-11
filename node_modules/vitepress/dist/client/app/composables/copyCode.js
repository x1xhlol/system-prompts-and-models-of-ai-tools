import { inBrowser } from 'vitepress';
export function useCopyCode() {
    if (inBrowser) {
        const timeoutIdMap = new WeakMap();
        window.addEventListener('click', (e) => {
            const el = e.target;
            if (el.matches('div[class*="language-"] > button.copy')) {
                const parent = el.parentElement;
                const sibling = el.nextElementSibling?.nextElementSibling;
                if (!parent || !sibling) {
                    return;
                }
                const isShell = /language-(shellscript|shell|bash|sh|zsh)/.test(parent.className);
                const ignoredNodes = ['.vp-copy-ignore', '.diff.remove'];
                // Clone the node and remove the ignored nodes
                const clone = sibling.cloneNode(true);
                clone
                    .querySelectorAll(ignoredNodes.join(','))
                    .forEach((node) => node.remove());
                let text = clone.textContent || '';
                if (isShell) {
                    text = text.replace(/^ *(\$|>) /gm, '').trim();
                }
                copyToClipboard(text).then(() => {
                    el.classList.add('copied');
                    clearTimeout(timeoutIdMap.get(el));
                    const timeoutId = setTimeout(() => {
                        el.classList.remove('copied');
                        el.blur();
                        timeoutIdMap.delete(el);
                    }, 2000);
                    timeoutIdMap.set(el, timeoutId);
                });
            }
        });
    }
}
async function copyToClipboard(text) {
    try {
        return navigator.clipboard.writeText(text);
    }
    catch {
        const element = document.createElement('textarea');
        const previouslyFocusedElement = document.activeElement;
        element.value = text;
        // Prevent keyboard from showing on mobile
        element.setAttribute('readonly', '');
        element.style.contain = 'strict';
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.fontSize = '12pt'; // Prevent zooming on iOS
        const selection = document.getSelection();
        const originalRange = selection
            ? selection.rangeCount > 0 && selection.getRangeAt(0)
            : null;
        document.body.appendChild(element);
        element.select();
        // Explicit selection workaround for iOS
        element.selectionStart = 0;
        element.selectionEnd = text.length;
        document.execCommand('copy');
        document.body.removeChild(element);
        if (originalRange) {
            selection.removeAllRanges(); // originalRange can't be truthy when selection is falsy
            selection.addRange(originalRange);
        }
        // Get the focus back on the previously focused element, if any
        if (previouslyFocusedElement) {
            ;
            previouslyFocusedElement.focus();
        }
    }
}
