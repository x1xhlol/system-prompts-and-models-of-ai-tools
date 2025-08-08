import { Polling as XHR } from "./polling";
import { WebSocket } from "./websocket";
import { WebTransport } from "./webtransport";
declare const _default: {
    polling: typeof polling;
    websocket: typeof WebSocket;
    webtransport: typeof WebTransport;
};
export default _default;
/**
 * Polling polymorphic constructor.
 */
declare function polling(req: any): XHR;
declare namespace polling {
    var upgradesTo: string[];
}
