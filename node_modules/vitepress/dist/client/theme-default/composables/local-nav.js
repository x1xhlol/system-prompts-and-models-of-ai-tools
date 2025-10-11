import { onContentUpdated } from 'vitepress';
import { computed, shallowRef } from 'vue';
import { getHeaders } from '../composables/outline';
import { useData } from './data';
export function useLocalNav() {
    const { theme, frontmatter } = useData();
    const headers = shallowRef([]);
    const hasLocalNav = computed(() => {
        return headers.value.length > 0;
    });
    onContentUpdated(() => {
        headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline);
    });
    return {
        headers,
        hasLocalNav
    };
}
