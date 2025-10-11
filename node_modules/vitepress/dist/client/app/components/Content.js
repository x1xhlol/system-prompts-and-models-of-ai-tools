import { useData, useRoute } from 'vitepress';
import { defineComponent, h, watch } from 'vue';
import { contentUpdatedCallbacks } from '../utils';
const runCbs = () => contentUpdatedCallbacks.forEach((fn) => fn());
export const Content = defineComponent({
    name: 'VitePressContent',
    props: {
        as: { type: [Object, String], default: 'div' }
    },
    setup(props) {
        const route = useRoute();
        const { frontmatter, site } = useData();
        watch(frontmatter, runCbs, { deep: true, flush: 'post' });
        return () => h(props.as, site.value.contentProps ?? { style: { position: 'relative' } }, [
            route.component
                ? h(route.component, {
                    onVnodeMounted: runCbs,
                    onVnodeUpdated: runCbs,
                    onVnodeUnmounted: runCbs
                })
                : '404 Page Not Found'
        ]);
    }
});
