import { t as getDefaultExportFromCjs, u as c, n as disposeMdItInstance, v as clearCache, l as init, b as build, o as serve, w as version, q as createServer } from './chunk-D3CUZ4fa.js';
import * as vite from 'vite';
import { createLogger } from 'vite';
import 'node:path';
import 'node:url';
import 'node:crypto';
import 'node:module';
import 'node:process';
import 'node:fs/promises';
import 'node:fs';
import 'fs';
import 'node:events';
import 'node:stream';
import 'node:string_decoder';
import 'path';
import 'util';
import 'os';
import 'stream';
import 'readline';
import 'url';
import 'child_process';
import 'string_decoder';
import 'zlib';
import '@vue/shared';
import 'node:util';
import 'node:readline';
import 'node:tty';
import 'node:zlib';
import 'node:http';
import 'node:timers';
import 'node:querystring';
import 'tty';
import 'constants';
import 'assert';
import '@shikijs/transformers';
import 'shiki';
import './chunk-C-d2RJOW.js';
import 'node:worker_threads';
import 'minisearch';

var minimist$1;
var hasRequiredMinimist;

function requireMinimist () {
	if (hasRequiredMinimist) return minimist$1;
	hasRequiredMinimist = 1;

	function hasKey(obj, keys) {
		var o = obj;
		keys.slice(0, -1).forEach(function (key) {
			o = o[key] || {};
		});

		var key = keys[keys.length - 1];
		return key in o;
	}

	function isNumber(x) {
		if (typeof x === 'number') { return true; }
		if ((/^0x[0-9a-f]+$/i).test(x)) { return true; }
		return (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/).test(x);
	}

	function isConstructorOrProto(obj, key) {
		return (key === 'constructor' && typeof obj[key] === 'function') || key === '__proto__';
	}

	minimist$1 = function (args, opts) {
		if (!opts) { opts = {}; }

		var flags = {
			bools: {},
			strings: {},
			unknownFn: null,
		};

		if (typeof opts.unknown === 'function') {
			flags.unknownFn = opts.unknown;
		}

		if (typeof opts.boolean === 'boolean' && opts.boolean) {
			flags.allBools = true;
		} else {
			[].concat(opts.boolean).filter(Boolean).forEach(function (key) {
				flags.bools[key] = true;
			});
		}

		var aliases = {};

		function aliasIsBoolean(key) {
			return aliases[key].some(function (x) {
				return flags.bools[x];
			});
		}

		Object.keys(opts.alias || {}).forEach(function (key) {
			aliases[key] = [].concat(opts.alias[key]);
			aliases[key].forEach(function (x) {
				aliases[x] = [key].concat(aliases[key].filter(function (y) {
					return x !== y;
				}));
			});
		});

		[].concat(opts.string).filter(Boolean).forEach(function (key) {
			flags.strings[key] = true;
			if (aliases[key]) {
				[].concat(aliases[key]).forEach(function (k) {
					flags.strings[k] = true;
				});
			}
		});

		var defaults = opts.default || {};

		var argv = { _: [] };

		function argDefined(key, arg) {
			return (flags.allBools && (/^--[^=]+$/).test(arg))
				|| flags.strings[key]
				|| flags.bools[key]
				|| aliases[key];
		}

		function setKey(obj, keys, value) {
			var o = obj;
			for (var i = 0; i < keys.length - 1; i++) {
				var key = keys[i];
				if (isConstructorOrProto(o, key)) { return; }
				if (o[key] === undefined) { o[key] = {}; }
				if (
					o[key] === Object.prototype
					|| o[key] === Number.prototype
					|| o[key] === String.prototype
				) {
					o[key] = {};
				}
				if (o[key] === Array.prototype) { o[key] = []; }
				o = o[key];
			}

			var lastKey = keys[keys.length - 1];
			if (isConstructorOrProto(o, lastKey)) { return; }
			if (
				o === Object.prototype
				|| o === Number.prototype
				|| o === String.prototype
			) {
				o = {};
			}
			if (o === Array.prototype) { o = []; }
			if (o[lastKey] === undefined || flags.bools[lastKey] || typeof o[lastKey] === 'boolean') {
				o[lastKey] = value;
			} else if (Array.isArray(o[lastKey])) {
				o[lastKey].push(value);
			} else {
				o[lastKey] = [o[lastKey], value];
			}
		}

		function setArg(key, val, arg) {
			if (arg && flags.unknownFn && !argDefined(key, arg)) {
				if (flags.unknownFn(arg) === false) { return; }
			}

			var value = !flags.strings[key] && isNumber(val)
				? Number(val)
				: val;
			setKey(argv, key.split('.'), value);

			(aliases[key] || []).forEach(function (x) {
				setKey(argv, x.split('.'), value);
			});
		}

		Object.keys(flags.bools).forEach(function (key) {
			setArg(key, defaults[key] === undefined ? false : defaults[key]);
		});

		var notFlags = [];

		if (args.indexOf('--') !== -1) {
			notFlags = args.slice(args.indexOf('--') + 1);
			args = args.slice(0, args.indexOf('--'));
		}

		for (var i = 0; i < args.length; i++) {
			var arg = args[i];
			var key;
			var next;

			if ((/^--.+=/).test(arg)) {
				// Using [\s\S] instead of . because js doesn't support the
				// 'dotall' regex modifier. See:
				// http://stackoverflow.com/a/1068308/13216
				var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
				key = m[1];
				var value = m[2];
				if (flags.bools[key]) {
					value = value !== 'false';
				}
				setArg(key, value, arg);
			} else if ((/^--no-.+/).test(arg)) {
				key = arg.match(/^--no-(.+)/)[1];
				setArg(key, false, arg);
			} else if ((/^--.+/).test(arg)) {
				key = arg.match(/^--(.+)/)[1];
				next = args[i + 1];
				if (
					next !== undefined
					&& !(/^(-|--)[^-]/).test(next)
					&& !flags.bools[key]
					&& !flags.allBools
					&& (aliases[key] ? !aliasIsBoolean(key) : true)
				) {
					setArg(key, next, arg);
					i += 1;
				} else if ((/^(true|false)$/).test(next)) {
					setArg(key, next === 'true', arg);
					i += 1;
				} else {
					setArg(key, flags.strings[key] ? '' : true, arg);
				}
			} else if ((/^-[^-]+/).test(arg)) {
				var letters = arg.slice(1, -1).split('');

				var broken = false;
				for (var j = 0; j < letters.length; j++) {
					next = arg.slice(j + 2);

					if (next === '-') {
						setArg(letters[j], next, arg);
						continue;
					}

					if ((/[A-Za-z]/).test(letters[j]) && next[0] === '=') {
						setArg(letters[j], next.slice(1), arg);
						broken = true;
						break;
					}

					if (
						(/[A-Za-z]/).test(letters[j])
						&& (/-?\d+(\.\d*)?(e-?\d+)?$/).test(next)
					) {
						setArg(letters[j], next, arg);
						broken = true;
						break;
					}

					if (letters[j + 1] && letters[j + 1].match(/\W/)) {
						setArg(letters[j], arg.slice(j + 2), arg);
						broken = true;
						break;
					} else {
						setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
					}
				}

				key = arg.slice(-1)[0];
				if (!broken && key !== '-') {
					if (
						args[i + 1]
						&& !(/^(-|--)[^-]/).test(args[i + 1])
						&& !flags.bools[key]
						&& (aliases[key] ? !aliasIsBoolean(key) : true)
					) {
						setArg(key, args[i + 1], arg);
						i += 1;
					} else if (args[i + 1] && (/^(true|false)$/).test(args[i + 1])) {
						setArg(key, args[i + 1] === 'true', arg);
						i += 1;
					} else {
						setArg(key, flags.strings[key] ? '' : true, arg);
					}
				}
			} else {
				if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
					argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg));
				}
				if (opts.stopEarly) {
					argv._.push.apply(argv._, args.slice(i + 1));
					break;
				}
			}
		}

		Object.keys(defaults).forEach(function (k) {
			if (!hasKey(argv, k.split('.'))) {
				setKey(argv, k.split('.'), defaults[k]);

				(aliases[k] || []).forEach(function (x) {
					setKey(argv, x.split('.'), defaults[k]);
				});
			}
		});

		if (opts['--']) {
			argv['--'] = notFlags.slice();
		} else {
			notFlags.forEach(function (k) {
				argv._.push(k);
			});
		}

		return argv;
	};
	return minimist$1;
}

var minimistExports = requireMinimist();
var minimist = /*@__PURE__*/getDefaultExportFromCjs(minimistExports);

function bindShortcuts(server, createDevServer) {
  if (!server.httpServer || !process.stdin.isTTY || process.env.CI) {
    return;
  }
  server.config.logger.info(
    c.dim(c.green("  \u279C")) + c.dim("  press ") + c.bold("h") + c.dim(" to show help")
  );
  let actionRunning = false;
  const onInput = async (input) => {
    if (input === "" || input === "") {
      await server.close().finally(() => process.exit(1));
      return;
    }
    if (actionRunning) return;
    if (input === "h") {
      server.config.logger.info(
        [
          "",
          c.bold("  Shortcuts"),
          ...SHORTCUTS.map(
            (shortcut2) => c.dim("  press ") + c.bold(shortcut2.key) + c.dim(` to ${shortcut2.description}`)
          )
        ].join("\n")
      );
    }
    const shortcut = SHORTCUTS.find((shortcut2) => shortcut2.key === input);
    if (!shortcut) return;
    actionRunning = true;
    await shortcut.action(server, createDevServer);
    actionRunning = false;
  };
  process.stdin.setRawMode(true);
  process.stdin.on("data", onInput).setEncoding("utf8").resume();
  server.httpServer.on("close", () => {
    process.stdin.off("data", onInput).pause();
    process.stdin.setRawMode(false);
  });
}
const SHORTCUTS = [
  {
    key: "r",
    description: "restart the server",
    async action(server, createDevServer) {
      server.config.logger.info(c.green(`restarting server...
`), {
        clear: true,
        timestamp: true
      });
      disposeMdItInstance();
      clearCache();
      await server.close();
      await createDevServer();
    }
  },
  {
    key: "u",
    description: "show server url",
    action(server) {
      server.config.logger.info("");
      server.printUrls();
    }
  },
  {
    key: "o",
    description: "open in browser",
    action(server) {
      server.openBrowser();
    }
  },
  {
    key: "c",
    description: "clear console",
    action(server) {
      server.config.logger.clearScreen("error");
    }
  },
  {
    key: "q",
    description: "quit",
    async action(server) {
      await server.close().finally(() => process.exit());
    }
  }
];

if (process.env.DEBUG) {
  Error.stackTraceLimit = Infinity;
}
const argv = minimist(process.argv.slice(2));
const logVersion = (logger) => {
  logger.info(`
  ${c.green(`${c.bold("vitepress")} v${version}`)}
`, {
    clear: !logger.hasWarned
  });
};
const command = argv._[0];
const root = argv._[command ? 1 : 0];
if (root) {
  argv.root = root;
}
let restartPromise;
if (!command || command === "dev") {
  if (argv.force) {
    delete argv.force;
    argv.optimizeDeps = { force: true };
  }
  const createDevServer = async (isRestart = true) => {
    const server = await createServer(root, argv, async () => {
      if (!restartPromise) {
        restartPromise = (async () => {
          await server.close();
          await createDevServer();
        })().finally(() => {
          restartPromise = undefined;
        });
      }
      return restartPromise;
    });
    await server.listen(undefined, isRestart);
    logVersion(server.config.logger);
    server.printUrls();
    bindShortcuts(server, createDevServer);
    if (!isRestart && vite.rolldownVersion) {
      server.config.logger.error(
        c.red(
          "\nVitePress v1 is not compatible with `rolldown-vite`. Use VitePress v2 instead."
        )
      );
    }
  };
  createDevServer(false).catch((err) => {
    createLogger().error(
      `${c.red(`failed to start server. error:`)}
${err.message}
${err.stack}`
    );
    process.exit(1);
  });
} else if (command === "init") {
  createLogger().info("", { clear: true });
  init(argv.root);
} else {
  if (command === "build") {
    build(root, {
      ...argv,
      onAfterConfigResolve(siteConfig) {
        logVersion(siteConfig.logger);
      }
    }).catch((err) => {
      createLogger().error(
        `${c.red(`build error:`)}
${err.message}
${err.stack}`
      );
      process.exit(1);
    });
  } else if (command === "serve" || command === "preview") {
    serve(argv).catch((err) => {
      createLogger().error(
        `${c.red(`failed to start server. error:`)}
${err.message}
${err.stack}`
      );
      process.exit(1);
    });
  } else {
    createLogger().error(c.red(`unknown command "${command}".`));
    process.exit(1);
  }
}
