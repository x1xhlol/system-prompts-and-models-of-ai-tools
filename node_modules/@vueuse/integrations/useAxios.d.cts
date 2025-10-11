import { AxiosResponse, AxiosRequestConfig, AxiosInstance } from 'axios';
import { ShallowRef, Ref } from 'vue';

interface UseAxiosReturn<T, R = AxiosResponse<T>, _D = any, O extends UseAxiosOptions = UseAxiosOptions<T>> {
    /**
     * Axios Response
     */
    response: ShallowRef<R | undefined>;
    /**
     * Axios response data
     */
    data: O extends UseAxiosOptionsWithInitialData<T> ? Ref<T> : Ref<T | undefined>;
    /**
     * Indicates if the request has finished
     */
    isFinished: Ref<boolean>;
    /**
     * Indicates if the request is currently loading
     */
    isLoading: Ref<boolean>;
    /**
     * Indicates if the request was canceled
     */
    isAborted: Ref<boolean>;
    /**
     * Any errors that may have occurred
     */
    error: ShallowRef<unknown | undefined>;
    /**
     * Aborts the current request
     */
    abort: (message?: string | undefined) => void;
    /**
     * Alias to `abort`
     */
    cancel: (message?: string | undefined) => void;
    /**
     * Alias to `isAborted`
     */
    isCanceled: Ref<boolean>;
}
interface StrictUseAxiosReturn<T, R, D, O extends UseAxiosOptions = UseAxiosOptions<T>> extends UseAxiosReturn<T, R, D, O> {
    /**
     * Manually call the axios request
     */
    execute: (url?: string | AxiosRequestConfig<D>, config?: AxiosRequestConfig<D>) => Promise<StrictUseAxiosReturn<T, R, D, O>>;
}
interface EasyUseAxiosReturn<T, R, D> extends UseAxiosReturn<T, R, D> {
    /**
     * Manually call the axios request
     */
    execute: (url: string, config?: AxiosRequestConfig<D>) => Promise<EasyUseAxiosReturn<T, R, D>>;
}
interface UseAxiosOptionsBase<T = any> {
    /**
     * Will automatically run axios request when `useAxios` is used
     *
     */
    immediate?: boolean;
    /**
     * Use shallowRef.
     *
     * @default true
     */
    shallow?: boolean;
    /**
     * Abort previous request when a new request is made.
     *
     * @default true
     */
    abortPrevious?: boolean;
    /**
     * Callback when error is caught.
     */
    onError?: (e: unknown) => void;
    /**
     * Callback when success is caught.
     */
    onSuccess?: (data: T) => void;
    /**
     * Sets the state to initialState before executing the promise.
     */
    resetOnExecute?: boolean;
    /**
     * Callback when request is finished.
     */
    onFinish?: () => void;
}
interface UseAxiosOptionsWithInitialData<T> extends UseAxiosOptionsBase<T> {
    /**
     * Initial data
     */
    initialData: T;
}
type UseAxiosOptions<T = any> = UseAxiosOptionsBase<T> | UseAxiosOptionsWithInitialData<T>;
declare function useAxios<T = any, R = AxiosResponse<T>, D = any, O extends UseAxiosOptionsWithInitialData<T> = UseAxiosOptionsWithInitialData<T>>(url: string, config?: AxiosRequestConfig<D>, options?: O): StrictUseAxiosReturn<T, R, D, O> & Promise<StrictUseAxiosReturn<T, R, D, O>>;
declare function useAxios<T = any, R = AxiosResponse<T>, D = any, O extends UseAxiosOptionsWithInitialData<T> = UseAxiosOptionsWithInitialData<T>>(url: string, instance?: AxiosInstance, options?: O): StrictUseAxiosReturn<T, R, D, O> & Promise<StrictUseAxiosReturn<T, R, D, O>>;
declare function useAxios<T = any, R = AxiosResponse<T>, D = any, O extends UseAxiosOptionsWithInitialData<T> = UseAxiosOptionsWithInitialData<T>>(url: string, config: AxiosRequestConfig<D>, instance: AxiosInstance, options?: O): StrictUseAxiosReturn<T, R, D, O> & Promise<StrictUseAxiosReturn<T, R, D, O>>;
declare function useAxios<T = any, R = AxiosResponse<T>, D = any, O extends UseAxiosOptionsBase<T> = UseAxiosOptionsBase<T>>(url: string, config?: AxiosRequestConfig<D>, options?: O): StrictUseAxiosReturn<T, R, D, O> & Promise<StrictUseAxiosReturn<T, R, D, O>>;
declare function useAxios<T = any, R = AxiosResponse<T>, D = any, O extends UseAxiosOptionsBase<T> = UseAxiosOptionsBase<T>>(url: string, instance?: AxiosInstance, options?: O): StrictUseAxiosReturn<T, R, D, O> & Promise<StrictUseAxiosReturn<T, R, D, O>>;
declare function useAxios<T = any, R = AxiosResponse<T>, D = any, O extends UseAxiosOptionsBase<T> = UseAxiosOptionsBase<T>>(url: string, config: AxiosRequestConfig<D>, instance: AxiosInstance, options?: O): StrictUseAxiosReturn<T, R, D, O> & Promise<StrictUseAxiosReturn<T, R, D, O>>;
declare function useAxios<T = any, R = AxiosResponse<T>, D = any>(config?: AxiosRequestConfig<D>): EasyUseAxiosReturn<T, R, D> & Promise<EasyUseAxiosReturn<T, R, D>>;
declare function useAxios<T = any, R = AxiosResponse<T>, D = any>(instance?: AxiosInstance): EasyUseAxiosReturn<T, R, D> & Promise<EasyUseAxiosReturn<T, R, D>>;
declare function useAxios<T = any, R = AxiosResponse<T>, D = any>(config?: AxiosRequestConfig<D>, instance?: AxiosInstance): EasyUseAxiosReturn<T, R, D> & Promise<EasyUseAxiosReturn<T, R, D>>;

export { type EasyUseAxiosReturn, type StrictUseAxiosReturn, type UseAxiosOptions, type UseAxiosOptionsBase, type UseAxiosOptionsWithInitialData, type UseAxiosReturn, useAxios };
