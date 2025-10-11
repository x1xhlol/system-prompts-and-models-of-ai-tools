import * as vue from 'vue';
import { PropType } from 'vue';
import { Rules } from 'async-validator';

declare const UseAsyncValidator: vue.DefineComponent<vue.ExtractPropTypes<{
    form: {
        type: PropType<Record<string, any>>;
        required: true;
    };
    rules: {
        type: PropType<Rules>;
        required: true;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>[] | undefined, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    form: {
        type: PropType<Record<string, any>>;
        required: true;
    };
    rules: {
        type: PropType<Rules>;
        required: true;
    };
}>> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

export { UseAsyncValidator };
