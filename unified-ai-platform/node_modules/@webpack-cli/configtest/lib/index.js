"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WEBPACK_PACKAGE = process.env.WEBPACK_PACKAGE || "webpack";
class ConfigTestCommand {
    async apply(cli) {
        await cli.makeCommand({
            name: "configtest [config-path]",
            alias: "t",
            description: "Validate a webpack configuration.",
            pkg: "@webpack-cli/configtest",
            dependencies: [WEBPACK_PACKAGE],
        }, [], async (configPath) => {
            cli.webpack = await cli.loadWebpack();
            const config = await cli.loadConfig(configPath ? { config: [configPath] } : {});
            const configPaths = new Set();
            if (Array.isArray(config.options)) {
                config.options.forEach((options) => {
                    const loadedConfigPaths = config.path.get(options);
                    if (loadedConfigPaths) {
                        loadedConfigPaths.forEach((path) => configPaths.add(path));
                    }
                });
            }
            else {
                if (config.path.get(config.options)) {
                    const loadedConfigPaths = config.path.get(config.options);
                    if (loadedConfigPaths) {
                        loadedConfigPaths.forEach((path) => configPaths.add(path));
                    }
                }
            }
            if (configPaths.size === 0) {
                cli.logger.error("No configuration found.");
                process.exit(2);
            }
            cli.logger.info(`Validate '${Array.from(configPaths).join(" ,")}'.`);
            try {
                cli.webpack.validate(config.options);
            }
            catch (error) {
                if (cli.isValidationError(error)) {
                    cli.logger.error(error.message);
                }
                else {
                    cli.logger.error(error);
                }
                process.exit(2);
            }
            cli.logger.success("There are no validation errors in the given webpack configuration.");
        });
    }
}
exports.default = ConfigTestCommand;
