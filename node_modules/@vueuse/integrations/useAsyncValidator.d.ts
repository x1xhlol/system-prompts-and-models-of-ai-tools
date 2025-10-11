import { ValidateError, ValidateOption, Rules } from 'async-validator';
import { ShallowRef, ComputedRef, MaybeRefOrGetter } from 'vue';

type AsyncValidatorError = Error & {
    errors: ValidateError[];
    fields: Record<string, ValidateError[]>;
};
interface UseAsyncValidatorExecuteReturn {
    pass: boolean;
    errors: AsyncValidatorError['errors'] | undefined;
    errorInfo: AsyncValidatorError | null;
    errorFields: AsyncValidatorError['fields'] | undefined;
}
interface UseAsyncValidatorReturn {
    pass: ShallowRef<boolean>;
    isFinished: ShallowRef<boolean>;
    errors: ComputedRef<AsyncValidatorError['errors'] | undefined>;
    errorInfo: ShallowRef<AsyncValidatorError | null>;
    errorFields: ComputedRef<AsyncValidatorError['fields'] | undefined>;
    execute: () => Promise<UseAsyncValidatorExecuteReturn>;
}
interface UseAsyncValidatorOptions {
    /**
     * @see https://github.com/yiminghe/async-validator#options
     */
    validateOption?: ValidateOption;
    /**
     * The validation will be triggered right away for the first time.
     * Only works when `manual` is not set to true.
     *
     * @default true
     */
    immediate?: boolean;
    /**
     * If set to true, the validation will not be triggered automatically.
     */
    manual?: boolean;
}
/**
 * Wrapper for async-validator.
 *
 * @see https://vueuse.org/useAsyncValidator
 * @see https://github.com/yiminghe/async-validator
 */
declare function useAsyncValidator(value: MaybeRefOrGetter<Record<string, any>>, rules: MaybeRefOrGetter<Rules>, options?: UseAsyncValidatorOptions): UseAsyncValidatorReturn & PromiseLike<UseAsyncValidatorReturn>;

export { type AsyncValidatorError, type UseAsyncValidatorExecuteReturn, type UseAsyncValidatorOptions, type UseAsyncValidatorReturn, useAsyncValidator };
