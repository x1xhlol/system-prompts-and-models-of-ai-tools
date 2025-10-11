import { DocSearchProps as DocSearchProps$1 } from '@docsearch/react';

interface DocSearchProps extends DocSearchProps$1 {
    container: HTMLElement | string;
    environment?: typeof window;
}
declare function docsearch(props: DocSearchProps): void;

export { docsearch as default };
