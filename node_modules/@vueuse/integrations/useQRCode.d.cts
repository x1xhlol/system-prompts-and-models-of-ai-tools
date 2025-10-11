import * as vue from 'vue';
import { MaybeRefOrGetter } from 'vue';
import QRCode from 'qrcode';

/**
 * Wrapper for qrcode.
 *
 * @see https://vueuse.org/useQRCode
 * @param text
 * @param options
 */
declare function useQRCode(text: MaybeRefOrGetter<string>, options?: QRCode.QRCodeToDataURLOptions): vue.ShallowRef<string, string>;

export { useQRCode };
