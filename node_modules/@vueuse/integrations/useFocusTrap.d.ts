import { Fn, Arrayable, MaybeComputedElementRef } from '@vueuse/core';
import { Options, ActivateOptions, DeactivateOptions } from 'focus-trap';
import { ShallowRef, MaybeRefOrGetter } from 'vue';

interface UseFocusTrapOptions extends Options {
    /**
     * Immediately activate the trap
     */
    immediate?: boolean;
}
interface UseFocusTrapReturn {
    /**
     * Indicates if the focus trap is currently active
     */
    hasFocus: ShallowRef<boolean>;
    /**
     * Indicates if the focus trap is currently paused
     */
    isPaused: ShallowRef<boolean>;
    /**
     * Activate the focus trap
     *
     * @see https://github.com/focus-trap/focus-trap#trapactivateactivateoptions
     * @param opts Activate focus trap options
     */
    activate: (opts?: ActivateOptions) => void;
    /**
     * Deactivate the focus trap
     *
     * @see https://github.com/focus-trap/focus-trap#trapdeactivatedeactivateoptions
     * @param opts Deactivate focus trap options
     */
    deactivate: (opts?: DeactivateOptions) => void;
    /**
     * Pause the focus trap
     *
     * @see https://github.com/focus-trap/focus-trap#trappause
     */
    pause: Fn;
    /**
     * Unpauses the focus trap
     *
     * @see https://github.com/focus-trap/focus-trap#trapunpause
     */
    unpause: Fn;
}
/**
 * Reactive focus-trap
 *
 * @see https://vueuse.org/useFocusTrap
 */
declare function useFocusTrap(target: Arrayable<MaybeRefOrGetter<string> | MaybeComputedElementRef>, options?: UseFocusTrapOptions): UseFocusTrapReturn;

export { type UseFocusTrapOptions, type UseFocusTrapReturn, useFocusTrap };
