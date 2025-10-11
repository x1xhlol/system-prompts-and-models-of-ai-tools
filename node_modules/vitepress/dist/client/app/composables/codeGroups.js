import { inBrowser, onContentUpdated } from 'vitepress';
export function useCodeGroups() {
    if (import.meta.env.DEV) {
        onContentUpdated(() => {
            document.querySelectorAll('.vp-code-group > .blocks').forEach((el) => {
                Array.from(el.children).forEach((child) => {
                    child.classList.remove('active');
                });
                el.children[0].classList.add('active');
            });
        });
    }
    if (inBrowser) {
        window.addEventListener('click', (e) => {
            const el = e.target;
            if (el.matches('.vp-code-group input')) {
                // input <- .tabs <- .vp-code-group
                const group = el.parentElement?.parentElement;
                if (!group)
                    return;
                const i = Array.from(group.querySelectorAll('input')).indexOf(el);
                if (i < 0)
                    return;
                const blocks = group.querySelector('.blocks');
                if (!blocks)
                    return;
                const current = Array.from(blocks.children).find((child) => child.classList.contains('active'));
                if (!current)
                    return;
                const next = blocks.children[i];
                if (!next || current === next)
                    return;
                current.classList.remove('active');
                next.classList.add('active');
                const label = group?.querySelector(`label[for="${el.id}"]`);
                label?.scrollIntoView({ block: 'nearest' });
            }
        });
    }
}
