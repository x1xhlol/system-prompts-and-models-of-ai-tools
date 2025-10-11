/// <reference types="react" />
export declare type Pragma = (type: any, props: Record<string, any> | null, ...children: ComponentChildren[]) => JSX.Element;
export declare type PragmaFrag = any;
declare type ComponentChild = VNode<any> | string | number | boolean | null | undefined;
declare type ComponentChildren = ComponentChild[] | ComponentChild;
export declare type VNode<TProps = {}> = {
    type: any;
    key: string | number | any;
    props: TProps & {
        children: ComponentChildren;
    };
};
export declare type Render = (vnode: ComponentChild, parent: Element | Document | ShadowRoot | DocumentFragment, replaceNode?: Element | Text | undefined) => void;
export declare type AutocompleteRenderer = {
    /**
     * The function to create virtual nodes.
     *
     * @default preact.createElement
     */
    createElement: Pragma;
    /**
     * The component to use to create fragments.
     *
     * @default preact.Fragment
     */
    Fragment: PragmaFrag;
    /**
     * The function to render children to an element.
     */
    render?: Render;
};
export declare type HTMLTemplate = (strings: TemplateStringsArray, ...values: any[]) => VNode | VNode[];
export {};
