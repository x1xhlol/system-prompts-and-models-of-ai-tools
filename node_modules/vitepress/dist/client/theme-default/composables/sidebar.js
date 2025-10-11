import { useMediaQuery } from '@vueuse/core';
import { computed, onMounted, onUnmounted, ref, watch, watchEffect, watchPostEffect } from 'vue';
import { isActive } from '../../shared';
import { hasActiveLink as containsActiveLink, getSidebar, getSidebarGroups } from '../support/sidebar';
import { useData } from './data';
export function useSidebar() {
    const { frontmatter, page, theme } = useData();
    const is960 = useMediaQuery('(min-width: 960px)');
    const isOpen = ref(false);
    const _sidebar = computed(() => {
        const sidebarConfig = theme.value.sidebar;
        const relativePath = page.value.relativePath;
        return sidebarConfig ? getSidebar(sidebarConfig, relativePath) : [];
    });
    const sidebar = ref(_sidebar.value);
    watch(_sidebar, (next, prev) => {
        if (JSON.stringify(next) !== JSON.stringify(prev))
            sidebar.value = _sidebar.value;
    });
    const hasSidebar = computed(() => {
        return (frontmatter.value.sidebar !== false &&
            sidebar.value.length > 0 &&
            frontmatter.value.layout !== 'home');
    });
    const leftAside = computed(() => {
        if (hasAside)
            return frontmatter.value.aside == null
                ? theme.value.aside === 'left'
                : frontmatter.value.aside === 'left';
        return false;
    });
    const hasAside = computed(() => {
        if (frontmatter.value.layout === 'home')
            return false;
        if (frontmatter.value.aside != null)
            return !!frontmatter.value.aside;
        return theme.value.aside !== false;
    });
    const isSidebarEnabled = computed(() => hasSidebar.value && is960.value);
    const sidebarGroups = computed(() => {
        return hasSidebar.value ? getSidebarGroups(sidebar.value) : [];
    });
    function open() {
        isOpen.value = true;
    }
    function close() {
        isOpen.value = false;
    }
    function toggle() {
        isOpen.value ? close() : open();
    }
    return {
        isOpen,
        sidebar,
        sidebarGroups,
        hasSidebar,
        hasAside,
        leftAside,
        isSidebarEnabled,
        open,
        close,
        toggle
    };
}
/**
 * a11y: cache the element that opened the Sidebar (the menu button) then
 * focus that button again when Menu is closed with Escape key.
 */
export function useCloseSidebarOnEscape(isOpen, close) {
    let triggerElement;
    watchEffect(() => {
        triggerElement = isOpen.value
            ? document.activeElement
            : undefined;
    });
    onMounted(() => {
        window.addEventListener('keyup', onEscape);
    });
    onUnmounted(() => {
        window.removeEventListener('keyup', onEscape);
    });
    function onEscape(e) {
        if (e.key === 'Escape' && isOpen.value) {
            close();
            triggerElement?.focus();
        }
    }
}
export function useSidebarControl(item) {
    const { page, hash } = useData();
    const collapsed = ref(false);
    const collapsible = computed(() => {
        return item.value.collapsed != null;
    });
    const isLink = computed(() => {
        return !!item.value.link;
    });
    const isActiveLink = ref(false);
    const updateIsActiveLink = () => {
        isActiveLink.value = isActive(page.value.relativePath, item.value.link);
    };
    watch([page, item, hash], updateIsActiveLink);
    onMounted(updateIsActiveLink);
    const hasActiveLink = computed(() => {
        if (isActiveLink.value) {
            return true;
        }
        return item.value.items
            ? containsActiveLink(page.value.relativePath, item.value.items)
            : false;
    });
    const hasChildren = computed(() => {
        return !!(item.value.items && item.value.items.length);
    });
    watchEffect(() => {
        collapsed.value = !!(collapsible.value && item.value.collapsed);
    });
    watchPostEffect(() => {
        ;
        (isActiveLink.value || hasActiveLink.value) && (collapsed.value = false);
    });
    function toggle() {
        if (collapsible.value) {
            collapsed.value = !collapsed.value;
        }
    }
    return {
        collapsed,
        collapsible,
        isLink,
        isActiveLink,
        hasActiveLink,
        hasChildren,
        toggle
    };
}
