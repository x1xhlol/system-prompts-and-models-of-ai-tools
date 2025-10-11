import { ConfigurableDocument } from '@vueuse/core';
import Sortable, { Options } from 'sortablejs';
import { MaybeRefOrGetter } from 'vue';

interface UseSortableReturn {
    /**
     * start sortable instance
     */
    start: () => void;
    /**
     * destroy sortable instance
     */
    stop: () => void;
    /**
     * Options getter/setter
     * @param name a Sortable.Options property.
     * @param value a value.
     */
    option: (<K extends keyof Sortable.Options>(name: K, value: Sortable.Options[K]) => void) & (<K extends keyof Sortable.Options>(name: K) => Sortable.Options[K]);
}
type UseSortableOptions = Options & ConfigurableDocument;
declare function useSortable<T>(selector: string, list: MaybeRefOrGetter<T[]>, options?: UseSortableOptions): UseSortableReturn;
declare function useSortable<T>(el: MaybeRefOrGetter<HTMLElement | null | undefined>, list: MaybeRefOrGetter<T[]>, options?: UseSortableOptions): UseSortableReturn;
/**
 * Inserts a element into the DOM at a given index.
 * @param parentElement
 * @param element
 * @param {number} index
 * @see https://github.com/Alfred-Skyblue/vue-draggable-plus/blob/a3829222095e1949bf2c9a20979d7b5930e66f14/src/utils/index.ts#L81C1-L94C2
 */
declare function insertNodeAt(parentElement: Element, element: Element, index: number): void;
/**
 * Removes a node from the DOM.
 * @param {Node} node
 * @see https://github.com/Alfred-Skyblue/vue-draggable-plus/blob/a3829222095e1949bf2c9a20979d7b5930e66f14/src/utils/index.ts#L96C1-L102C2
 */
declare function removeNode(node: Node): void;
declare function moveArrayElement<T>(list: MaybeRefOrGetter<T[]>, from: number, to: number, e?: Sortable.SortableEvent | null): void;

export { type UseSortableOptions, type UseSortableReturn, insertNodeAt, moveArrayElement, removeNode, useSortable };
