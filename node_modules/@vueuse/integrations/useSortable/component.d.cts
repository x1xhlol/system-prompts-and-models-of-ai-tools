import * as vue from 'vue';
import { PropType } from 'vue';
import { ConfigurableDocument } from '@vueuse/core';
import { Options } from 'sortablejs';

type UseSortableOptions = Options & ConfigurableDocument;

declare const UseSortable: vue.DefineComponent<vue.ExtractPropTypes<{
    modelValue: {
        type: PropType<any[]>;
        required: true;
    };
    tag: {
        type: StringConstructor;
        default: string;
    };
    options: {
        type: PropType<UseSortableOptions>;
        required: true;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}> | undefined, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    modelValue: {
        type: PropType<any[]>;
        required: true;
    };
    tag: {
        type: StringConstructor;
        default: string;
    };
    options: {
        type: PropType<UseSortableOptions>;
        required: true;
    };
}>> & Readonly<{}>, {
    tag: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

export { UseSortable };
