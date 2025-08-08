import { Server, AttachOptions, ServerOptions } from "./server";
import transports from "./transports/index";
import * as parser from "engine.io-parser";
export { Server, transports, listen, attach, parser };
export type { AttachOptions, ServerOptions, BaseServer } from "./server";
export { uServer } from "./userver";
export { Socket } from "./socket";
export { Transport } from "./transport";
export declare const protocol = 4;
/**
 * Creates an http.Server exclusively used for WS upgrades.
 *
 * @param {Number} port
 * @param {Function} callback
 * @param {Object} options
 * @return {Server} websocket.io server
 */
declare function listen(port: any, options: AttachOptions & ServerOptions, fn: any): Server;
/**
 * Captures upgrade requests for a http.Server.
 *
 * @param {http.Server} server
 * @param {Object} options
 * @return {Server} engine server
 */
declare function attach(server: any, options: AttachOptions & ServerOptions): Server;
