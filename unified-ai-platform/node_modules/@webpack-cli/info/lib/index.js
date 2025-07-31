"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InfoCommand {
    async apply(cli) {
        await cli.makeCommand({
            name: "info",
            alias: "i",
            description: "Outputs information about your system.",
            usage: "[options]",
            pkg: "@webpack-cli/info",
        }, cli.getInfoOptions(), async (options) => {
            const info = await cli.getInfoOutput(options);
            cli.logger.raw(info);
        });
    }
}
exports.default = InfoCommand;
