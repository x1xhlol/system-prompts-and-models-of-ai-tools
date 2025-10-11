import * as vue from 'vue';
import { RenderableComponent } from '@vueuse/core';
import { Options } from 'focus-trap';

interface UseFocusTrapOptions extends Options {
    /**
     * Immediately activate the trap
     */
    immediate?: boolean;
}

interface ComponentUseFocusTrapOptions extends RenderableComponent {
    options?: UseFocusTrapOptions;
}
declare const UseFocusTrap: vue.DefineComponent<ComponentUseFocusTrapOptions, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<ComponentUseFocusTrapOptions> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, false, {}, any>;

export { type ComponentUseFocusTrapOptions, UseFocusTrap };
