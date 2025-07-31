'use strict';

var path = require('path');
var minimatch = require('minimatch');
var createDebug = require('debug');
var objectSchema = require('@humanwhocodes/object-schema');

/**
 * @fileoverview ConfigSchema
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const NOOP_STRATEGY = {
	required: false,
	merge() {
		return undefined;
	},
	validate() { }
};

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

/**
 * The base schema that every ConfigArray uses.
 * @type Object
 */
const baseSchema = Object.freeze({
	name: {
		required: false,
		merge() {
			return undefined;
		},
		validate(value) {
			if (typeof value !== 'string') {
				throw new TypeError('Property must be a string.');
			}
		}
	},
	files: NOOP_STRATEGY,
	ignores: NOOP_STRATEGY
});

/**
 * @fileoverview ConfigSchema
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Asserts that a given value is an array.
 * @param {*} value The value to check.
 * @returns {void}
 * @throws {TypeError} When the value is not an array.
 */
function assertIsArray(value) {
	if (!Array.isArray(value)) {
		throw new TypeError('Expected value to be an array.');
	}
}

/**
 * Asserts that a given value is an array containing only strings and functions.
 * @param {*} value The value to check.
 * @returns {void}
 * @throws {TypeError} When the value is not an array of strings and functions.
 */
function assertIsArrayOfStringsAndFunctions(value, name) {
	assertIsArray(value);

	if (value.some(item => typeof item !== 'string' && typeof item !== 'function')) {
		throw new TypeError('Expected array to only contain strings and functions.');
	}
}

/**
 * Asserts that a given value is a non-empty array.
 * @param {*} value The value to check.
 * @returns {void}
 * @throws {TypeError} When the value is not an array or an empty array.
 */
function assertIsNonEmptyArray(value) {
	if (!Array.isArray(value) || value.length === 0) {
		throw new TypeError('Expected value to be a non-empty array.');
	}
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

/**
 * The schema for `files` and `ignores` that every ConfigArray uses.
 * @type Object
 */
const filesAndIgnoresSchema = Object.freeze({
	files: {
		required: false,
		merge() {
			return undefined;
		},
		validate(value) {

			// first check if it's an array
			assertIsNonEmptyArray(value);

			// then check each member
			value.forEach(item => {
				if (Array.isArray(item)) {
					assertIsArrayOfStringsAndFunctions(item);
				} else if (typeof item !== 'string' && typeof item !== 'function') {
					throw new TypeError('Items must be a string, a function, or an array of strings and functions.');
				}
			});

		}
	},
	ignores: {
		required: false,
		merge() {
			return undefined;
		},
		validate: assertIsArrayOfStringsAndFunctions
	}
});

/**
 * @fileoverview ConfigArray
 * @author Nicholas C. Zakas
 */


//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const Minimatch = minimatch.Minimatch;
const minimatchCache = new Map();
const negatedMinimatchCache = new Map();
const debug = createDebug('@hwc/config-array');

const MINIMATCH_OPTIONS = {
	// matchBase: true,
	dot: true
};

const CONFIG_TYPES = new Set(['array', 'function']);

/**
 * Fields that are considered metadata and not part of the config object.
 */
const META_FIELDS = new Set(['name']);

const FILES_AND_IGNORES_SCHEMA = new objectSchema.ObjectSchema(filesAndIgnoresSchema);

/**
 * Wrapper error for config validation errors that adds a name to the front of the
 * error message.
 */
class ConfigError extends Error {

	/**
	 * Creates a new instance.
	 * @param {string} name The config object name causing the error.
	 * @param {number} index The index of the config object in the array.
	 * @param {Error} source The source error. 
	 */
	constructor(name, index, { cause, message }) {


		const finalMessage = message || cause.message;

		super(`Config ${name}: ${finalMessage}`, { cause });

		// copy over custom properties that aren't represented
		if (cause) {
			for (const key of Object.keys(cause)) {
				if (!(key in this)) {
					this[key] = cause[key];
				}
			}
		}

		/**
		 * The name of the error.
		 * @type {string}
		 * @readonly
		 */
		this.name = 'ConfigError';

		/**
		 * The index of the config object in the array.
		 * @type {number}
		 * @readonly
		 */
		this.index = index;
	}
}

/**
 * Gets the name of a config object.
 * @param {object} config The config object to get the name of.
 * @returns {string} The name of the config object.
 */ 
function getConfigName(config) {
	if (config && typeof config.name === 'string' && config.name) {
		return `"${config.name}"`;
	}

	return '(unnamed)';
}

/**
 * Rethrows a config error with additional information about the config object.
 * @param {object} config The config object to get the name of. 
 * @param {number} index The index of the config object in the array.
 * @param {Error} error The error to rethrow.
 * @throws {ConfigError} When the error is rethrown for a config.
 */
function rethrowConfigError(config, index, error) {
	const configName = getConfigName(config);
	throw new ConfigError(configName, index, error);
}

/**
 * Shorthand for checking if a value is a string.
 * @param {any} value The value to check.
 * @returns {boolean} True if a string, false if not. 
 */
function isString(value) {
	return typeof value === 'string';
}

/**
 * Creates a function that asserts that the config is valid
 * during normalization. This checks that the config is not nullish
 * and that files and ignores keys  of a config object are valid as per base schema.
 * @param {Object} config The config object to check.
 * @param {number} index The index of the config object in the array.
 * @returns {void}
 * @throws {ConfigError} If the files and ignores keys of a config object are not valid.
 */
function assertValidBaseConfig(config, index) {

	if (config === null) {
		throw new ConfigError(getConfigName(config), index, { message: 'Unexpected null config.' });
	}

	if (config === undefined) {
		throw new ConfigError(getConfigName(config), index, { message: 'Unexpected undefined config.' });
	}

	if (typeof config !== 'object') {
		throw new ConfigError(getConfigName(config), index, { message: 'Unexpected non-object config.' });
	}

	const validateConfig = { };
	
	if ('files' in config) {
		validateConfig.files = config.files;
	}
	
	if ('ignores' in config) {
		validateConfig.ignores = config.ignores;
	}

	try {
		FILES_AND_IGNORES_SCHEMA.validate(validateConfig);
	} catch (validationError) {
		rethrowConfigError(config, index, { cause: validationError });
	}
}

/**
 * Wrapper around minimatch that caches minimatch patterns for
 * faster matching speed over multiple file path evaluations.
 * @param {string} filepath The file path to match.
 * @param {string} pattern The glob pattern to match against.
 * @param {object} options The minimatch options to use.
 * @returns 
 */
function doMatch(filepath, pattern, options = {}) {

	let cache = minimatchCache;

	if (options.flipNegate) {
		cache = negatedMinimatchCache;
	}

	let matcher = cache.get(pattern);

	if (!matcher) {
		matcher = new Minimatch(pattern, Object.assign({}, MINIMATCH_OPTIONS, options));
		cache.set(pattern, matcher);
	}

	return matcher.match(filepath);
}

/**
 * Normalizes a `ConfigArray` by flattening it and executing any functions
 * that are found inside.
 * @param {Array} items The items in a `ConfigArray`.
 * @param {Object} context The context object to pass into any function
 *      found.
 * @param {Array<string>} extraConfigTypes The config types to check.
 * @returns {Promise<Array>} A flattened array containing only config objects.
 * @throws {TypeError} When a config function returns a function.
 */
async function normalize(items, context, extraConfigTypes) {

	const allowFunctions = extraConfigTypes.includes('function');
	const allowArrays = extraConfigTypes.includes('array');

	async function* flatTraverse(array) {
		for (let item of array) {
			if (typeof item === 'function') {
				if (!allowFunctions) {
					throw new TypeError('Unexpected function.');
				}

				item = item(context);
				if (item.then) {
					item = await item;
				}
			}

			if (Array.isArray(item)) {
				if (!allowArrays) {
					throw new TypeError('Unexpected array.');
				}
				yield* flatTraverse(item);
			} else if (typeof item === 'function') {
				throw new TypeError('A config function can only return an object or array.');
			} else {
				yield item;
			}
		}
	}

	/*
	 * Async iterables cannot be used with the spread operator, so we need to manually
	 * create the array to return.
	 */
	const asyncIterable = await flatTraverse(items);
	const configs = [];

	for await (const config of asyncIterable) {
		configs.push(config);
	}

	return configs;
}

/**
 * Normalizes a `ConfigArray` by flattening it and executing any functions
 * that are found inside.
 * @param {Array} items The items in a `ConfigArray`.
 * @param {Object} context The context object to pass into any function
 *      found.
 * @param {Array<string>} extraConfigTypes The config types to check.
 * @returns {Array} A flattened array containing only config objects.
 * @throws {TypeError} When a config function returns a function.
 */
function normalizeSync(items, context, extraConfigTypes) {

	const allowFunctions = extraConfigTypes.includes('function');
	const allowArrays = extraConfigTypes.includes('array');

	function* flatTraverse(array) {
		for (let item of array) {
			if (typeof item === 'function') {

				if (!allowFunctions) {
					throw new TypeError('Unexpected function.');
				}

				item = item(context);
				if (item.then) {
					throw new TypeError('Async config functions are not supported.');
				}
			}

			if (Array.isArray(item)) {

				if (!allowArrays) {
					throw new TypeError('Unexpected array.');
				}

				yield* flatTraverse(item);
			} else if (typeof item === 'function') {
				throw new TypeError('A config function can only return an object or array.');
			} else {
				yield item;
			}
		}
	}

	return [...flatTraverse(items)];
}

/**
 * Determines if a given file path should be ignored based on the given
 * matcher.
 * @param {Array<string|() => boolean>} ignores The ignore patterns to check. 
 * @param {string} filePath The absolute path of the file to check.
 * @param {string} relativeFilePath The relative path of the file to check.
 * @returns {boolean} True if the path should be ignored and false if not.
 */
function shouldIgnorePath(ignores, filePath, relativeFilePath) {

	// all files outside of the basePath are ignored
	if (relativeFilePath.startsWith('..')) {
		return true;
	}

	return ignores.reduce((ignored, matcher) => {

		if (!ignored) {

			if (typeof matcher === 'function') {
				return matcher(filePath);
			}

			// don't check negated patterns because we're not ignored yet
			if (!matcher.startsWith('!')) {
				return doMatch(relativeFilePath, matcher);
			}

			// otherwise we're still not ignored
			return false;

		}

		// only need to check negated patterns because we're ignored
		if (typeof matcher === 'string' && matcher.startsWith('!')) {
			return !doMatch(relativeFilePath, matcher, {
				flipNegate: true
			});
		}

		return ignored;

	}, false);

}

/**
 * Determines if a given file path is matched by a config based on
 * `ignores` only.
 * @param {string} filePath The absolute file path to check.
 * @param {string} basePath The base path for the config.
 * @param {Object} config The config object to check.
 * @returns {boolean} True if the file path is matched by the config,
 *      false if not.
 */
function pathMatchesIgnores(filePath, basePath, config) {

	/*
	 * For both files and ignores, functions are passed the absolute
	 * file path while strings are compared against the relative
	 * file path.
	 */
	const relativeFilePath = path.relative(basePath, filePath);

	return Object.keys(config).filter(key => !META_FIELDS.has(key)).length > 1 &&
		!shouldIgnorePath(config.ignores, filePath, relativeFilePath);
}


/**
 * Determines if a given file path is matched by a config. If the config
 * has no `files` field, then it matches; otherwise, if a `files` field
 * is present then we match the globs in `files` and exclude any globs in
 * `ignores`.
 * @param {string} filePath The absolute file path to check.
 * @param {string} basePath The base path for the config.
 * @param {Object} config The config object to check.
 * @returns {boolean} True if the file path is matched by the config,
 *      false if not.
 */
function pathMatches(filePath, basePath, config) {

	/*
	 * For both files and ignores, functions are passed the absolute
	 * file path while strings are compared against the relative
	 * file path.
	 */
	const relativeFilePath = path.relative(basePath, filePath);

	// match both strings and functions
	const match = pattern => {

		if (isString(pattern)) {
			return doMatch(relativeFilePath, pattern);
		}

		if (typeof pattern === 'function') {
			return pattern(filePath);
		}

		throw new TypeError(`Unexpected matcher type ${pattern}.`);
	};

	// check for all matches to config.files
	let filePathMatchesPattern = config.files.some(pattern => {
		if (Array.isArray(pattern)) {
			return pattern.every(match);
		}

		return match(pattern);
	});

	/*
	 * If the file path matches the config.files patterns, then check to see
	 * if there are any files to ignore.
	 */
	if (filePathMatchesPattern && config.ignores) {
		filePathMatchesPattern = !shouldIgnorePath(config.ignores, filePath, relativeFilePath);
	}

	return filePathMatchesPattern;
}

/**
 * Ensures that a ConfigArray has been normalized.
 * @param {ConfigArray} configArray The ConfigArray to check. 
 * @returns {void}
 * @throws {Error} When the `ConfigArray` is not normalized.
 */
function assertNormalized(configArray) {
	// TODO: Throw more verbose error
	if (!configArray.isNormalized()) {
		throw new Error('ConfigArray must be normalized to perform this operation.');
	}
}

/**
 * Ensures that config types are valid.
 * @param {Array<string>} extraConfigTypes The config types to check.
 * @returns {void}
 * @throws {Error} When the config types array is invalid.
 */
function assertExtraConfigTypes(extraConfigTypes) {
	if (extraConfigTypes.length > 2) {
		throw new TypeError('configTypes must be an array with at most two items.');
	}

	for (const configType of extraConfigTypes) {
		if (!CONFIG_TYPES.has(configType)) {
			throw new TypeError(`Unexpected config type "${configType}" found. Expected one of: "object", "array", "function".`);
		}
	}
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

const ConfigArraySymbol = {
	isNormalized: Symbol('isNormalized'),
	configCache: Symbol('configCache'),
	schema: Symbol('schema'),
	finalizeConfig: Symbol('finalizeConfig'),
	preprocessConfig: Symbol('preprocessConfig')
};

// used to store calculate data for faster lookup
const dataCache = new WeakMap();

/**
 * Represents an array of config objects and provides method for working with
 * those config objects.
 */
class ConfigArray extends Array {

	/**
	 * Creates a new instance of ConfigArray.
	 * @param {Iterable|Function|Object} configs An iterable yielding config
	 *      objects, or a config function, or a config object.
	 * @param {string} [options.basePath=""] The path of the config file
	 * @param {boolean} [options.normalized=false] Flag indicating if the
	 *      configs have already been normalized.
	 * @param {Object} [options.schema] The additional schema 
	 *      definitions to use for the ConfigArray schema.
	 * @param {Array<string>} [options.configTypes] List of config types supported.
	 */
	constructor(configs, {
		basePath = '',
		normalized = false,
		schema: customSchema,
		extraConfigTypes = []
	} = {}
	) {
		super();

		/**
		 * Tracks if the array has been normalized.
		 * @property isNormalized
		 * @type {boolean}
		 * @private
		 */
		this[ConfigArraySymbol.isNormalized] = normalized;

		/**
		 * The schema used for validating and merging configs.
		 * @property schema
		 * @type ObjectSchema
		 * @private
		 */
		this[ConfigArraySymbol.schema] = new objectSchema.ObjectSchema(
			Object.assign({}, customSchema, baseSchema)
		);

		/**
		 * The path of the config file that this array was loaded from.
		 * This is used to calculate filename matches.
		 * @property basePath
		 * @type {string}
		 */
		this.basePath = basePath;

		assertExtraConfigTypes(extraConfigTypes);

		/**
		 * The supported config types.
		 * @property configTypes
		 * @type {Array<string>}
		 */
		this.extraConfigTypes = Object.freeze([...extraConfigTypes]);

		/**
		 * A cache to store calculated configs for faster repeat lookup.
		 * @property configCache
		 * @type {Map<string, Object>}
		 * @private
		 */
		this[ConfigArraySymbol.configCache] = new Map();

		// init cache
		dataCache.set(this, {
			explicitMatches: new Map(),
			directoryMatches: new Map(),
			files: undefined,
			ignores: undefined
		});

		// load the configs into this array
		if (Array.isArray(configs)) {
			this.push(...configs);
		} else {
			this.push(configs);
		}

	}

	/**
	 * Prevent normal array methods from creating a new `ConfigArray` instance.
	 * This is to ensure that methods such as `slice()` won't try to create a 
	 * new instance of `ConfigArray` behind the scenes as doing so may throw
	 * an error due to the different constructor signature.
	 * @returns {Function} The `Array` constructor.
	 */
	static get [Symbol.species]() {
		return Array;
	}

	/**
	 * Returns the `files` globs from every config object in the array.
	 * This can be used to determine which files will be matched by a
	 * config array or to use as a glob pattern when no patterns are provided
	 * for a command line interface.
	 * @returns {Array<string|Function>} An array of matchers.
	 */
	get files() {

		assertNormalized(this);

		// if this data has been cached, retrieve it
		const cache = dataCache.get(this);

		if (cache.files) {
			return cache.files;
		}

		// otherwise calculate it

		const result = [];

		for (const config of this) {
			if (config.files) {
				config.files.forEach(filePattern => {
					result.push(filePattern);
				});
			}
		}

		// store result
		cache.files = result;
		dataCache.set(this, cache);

		return result;
	}

	/**
	 * Returns ignore matchers that should always be ignored regardless of
	 * the matching `files` fields in any configs. This is necessary to mimic
	 * the behavior of things like .gitignore and .eslintignore, allowing a
	 * globbing operation to be faster.
	 * @returns {string[]} An array of string patterns and functions to be ignored.
	 */
	get ignores() {

		assertNormalized(this);

		// if this data has been cached, retrieve it
		const cache = dataCache.get(this);

		if (cache.ignores) {
			return cache.ignores;
		}

		// otherwise calculate it

		const result = [];

		for (const config of this) {

			/*
			 * We only count ignores if there are no other keys in the object.
			 * In this case, it acts list a globally ignored pattern. If there
			 * are additional keys, then ignores act like exclusions.
			 */
			if (config.ignores && Object.keys(config).filter(key => !META_FIELDS.has(key)).length === 1) {
				result.push(...config.ignores);
			}
		}

		// store result
		cache.ignores = result;
		dataCache.set(this, cache);

		return result;
	}

	/**
	 * Indicates if the config array has been normalized.
	 * @returns {boolean} True if the config array is normalized, false if not.
	 */
	isNormalized() {
		return this[ConfigArraySymbol.isNormalized];
	}

	/**
	 * Normalizes a config array by flattening embedded arrays and executing
	 * config functions.
	 * @param {ConfigContext} context The context object for config functions.
	 * @returns {Promise<ConfigArray>} The current ConfigArray instance.
	 */
	async normalize(context = {}) {

		if (!this.isNormalized()) {
			const normalizedConfigs = await normalize(this, context, this.extraConfigTypes);
			this.length = 0;
			this.push(...normalizedConfigs.map(this[ConfigArraySymbol.preprocessConfig].bind(this)));
			this.forEach(assertValidBaseConfig);
			this[ConfigArraySymbol.isNormalized] = true;

			// prevent further changes
			Object.freeze(this);
		}

		return this;
	}

	/**
	 * Normalizes a config array by flattening embedded arrays and executing
	 * config functions.
	 * @param {ConfigContext} context The context object for config functions.
	 * @returns {ConfigArray} The current ConfigArray instance.
	 */
	normalizeSync(context = {}) {

		if (!this.isNormalized()) {
			const normalizedConfigs = normalizeSync(this, context, this.extraConfigTypes);
			this.length = 0;
			this.push(...normalizedConfigs.map(this[ConfigArraySymbol.preprocessConfig].bind(this)));
			this.forEach(assertValidBaseConfig);
			this[ConfigArraySymbol.isNormalized] = true;

			// prevent further changes
			Object.freeze(this);
		}

		return this;
	}

	/**
	 * Finalizes the state of a config before being cached and returned by
	 * `getConfig()`. Does nothing by default but is provided to be
	 * overridden by subclasses as necessary.
	 * @param {Object} config The config to finalize.
	 * @returns {Object} The finalized config.
	 */
	[ConfigArraySymbol.finalizeConfig](config) {
		return config;
	}

	/**
	 * Preprocesses a config during the normalization process. This is the
	 * method to override if you want to convert an array item before it is
	 * validated for the first time. For example, if you want to replace a
	 * string with an object, this is the method to override.
	 * @param {Object} config The config to preprocess.
	 * @returns {Object} The config to use in place of the argument.
	 */
	[ConfigArraySymbol.preprocessConfig](config) {
		return config;
	}

	/**
	 * Determines if a given file path explicitly matches a `files` entry
	 * and also doesn't match an `ignores` entry. Configs that don't have
	 * a `files` property are not considered an explicit match.
	 * @param {string} filePath The complete path of a file to check.
	 * @returns {boolean} True if the file path matches a `files` entry
	 * 		or false if not.
	 */
	isExplicitMatch(filePath) {

		assertNormalized(this);

		const cache = dataCache.get(this);

		// first check the cache to avoid duplicate work
		let result = cache.explicitMatches.get(filePath);

		if (typeof result == 'boolean') {
			return result;
		}

		// TODO: Maybe move elsewhere? Maybe combine with getConfig() logic?
		const relativeFilePath = path.relative(this.basePath, filePath);

		if (shouldIgnorePath(this.ignores, filePath, relativeFilePath)) {
			debug(`Ignoring ${filePath}`);

			// cache and return result
			cache.explicitMatches.set(filePath, false);
			return false;
		}

		// filePath isn't automatically ignored, so try to find a match

		for (const config of this) {

			if (!config.files) {
				continue;
			}

			if (pathMatches(filePath, this.basePath, config)) {
				debug(`Matching config found for ${filePath}`);
				cache.explicitMatches.set(filePath, true);
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns the config object for a given file path.
	 * @param {string} filePath The complete path of a file to get a config for.
	 * @returns {Object} The config object for this file.
	 */
	getConfig(filePath) {

		assertNormalized(this);

		const cache = this[ConfigArraySymbol.configCache];

		// first check the cache for a filename match to avoid duplicate work
		if (cache.has(filePath)) {
			return cache.get(filePath);
		}

		let finalConfig;

		// next check to see if the file should be ignored

		// check if this should be ignored due to its directory
		if (this.isDirectoryIgnored(path.dirname(filePath))) {
			debug(`Ignoring ${filePath} based on directory pattern`);

			// cache and return result - finalConfig is undefined at this point
			cache.set(filePath, finalConfig);
			return finalConfig;
		}

		// TODO: Maybe move elsewhere?
		const relativeFilePath = path.relative(this.basePath, filePath);

		if (shouldIgnorePath(this.ignores, filePath, relativeFilePath)) {
			debug(`Ignoring ${filePath} based on file pattern`);

			// cache and return result - finalConfig is undefined at this point
			cache.set(filePath, finalConfig);
			return finalConfig;
		}

		// filePath isn't automatically ignored, so try to construct config

		const matchingConfigIndices = [];
		let matchFound = false;
		const universalPattern = /\/\*{1,2}$/;

		this.forEach((config, index) => {

			if (!config.files) {

				if (!config.ignores) {
					debug(`Anonymous universal config found for ${filePath}`);
					matchingConfigIndices.push(index);
					return;
				}

				if (pathMatchesIgnores(filePath, this.basePath, config)) {
					debug(`Matching config found for ${filePath} (based on ignores: ${config.ignores})`);
					matchingConfigIndices.push(index);
					return;
				}
				
				debug(`Skipped config found for ${filePath} (based on ignores: ${config.ignores})`);
				return;
			}

			/*
			 * If a config has a files pattern ending in /** or /*, and the
			 * filePath only matches those patterns, then the config is only
			 * applied if there is another config where the filePath matches
			 * a file with a specific extensions such as *.js.
			 */

			const universalFiles = config.files.filter(
				pattern => universalPattern.test(pattern)
			);

			// universal patterns were found so we need to check the config twice
			if (universalFiles.length) {

				debug('Universal files patterns found. Checking carefully.');

				const nonUniversalFiles = config.files.filter(
					pattern => !universalPattern.test(pattern)
				);

				// check that the config matches without the non-universal files first
				if (
					nonUniversalFiles.length && 
					pathMatches(
						filePath, this.basePath,
						{ files: nonUniversalFiles, ignores: config.ignores }
					)
				) {
					debug(`Matching config found for ${filePath}`);
					matchingConfigIndices.push(index);
					matchFound = true;
					return;
				}

				// if there wasn't a match then check if it matches with universal files
				if (
					universalFiles.length &&
					pathMatches(
						filePath, this.basePath,
						{ files: universalFiles, ignores: config.ignores }
					)
				) {
					debug(`Matching config found for ${filePath}`);
					matchingConfigIndices.push(index);
					return;
				}

				// if we make here, then there was no match
				return;
			}

			// the normal case
			if (pathMatches(filePath, this.basePath, config)) {
				debug(`Matching config found for ${filePath}`);
				matchingConfigIndices.push(index);
				matchFound = true;
				return;
			}

		});

		// if matching both files and ignores, there will be no config to create
		if (!matchFound) {
			debug(`No matching configs found for ${filePath}`);

			// cache and return result - finalConfig is undefined at this point
			cache.set(filePath, finalConfig);
			return finalConfig;
		}

		// check to see if there is a config cached by indices
		finalConfig = cache.get(matchingConfigIndices.toString());

		if (finalConfig) {

			// also store for filename for faster lookup next time
			cache.set(filePath, finalConfig);

			return finalConfig;
		}

		// otherwise construct the config

		finalConfig = matchingConfigIndices.reduce((result, index) => {
			try {
				return this[ConfigArraySymbol.schema].merge(result, this[index]);
			} catch (validationError) {
				rethrowConfigError(this[index], index, { cause: validationError});
			}
		}, {}, this);

		finalConfig = this[ConfigArraySymbol.finalizeConfig](finalConfig);

		cache.set(filePath, finalConfig);
		cache.set(matchingConfigIndices.toString(), finalConfig);

		return finalConfig;
	}

	/**
	 * Determines if the given filepath is ignored based on the configs.
	 * @param {string} filePath The complete path of a file to check.
	 * @returns {boolean} True if the path is ignored, false if not.
	 * @deprecated Use `isFileIgnored` instead.
	 */
	isIgnored(filePath) {
		return this.isFileIgnored(filePath);
	}

	/**
	 * Determines if the given filepath is ignored based on the configs.
	 * @param {string} filePath The complete path of a file to check.
	 * @returns {boolean} True if the path is ignored, false if not.
	 */
	isFileIgnored(filePath) {
		return this.getConfig(filePath) === undefined;
	}

	/**
	 * Determines if the given directory is ignored based on the configs.
	 * This checks only default `ignores` that don't have `files` in the 
	 * same config. A pattern such as `/foo` be considered to ignore the directory
	 * while a pattern such as `/foo/**` is not considered to ignore the
	 * directory because it is matching files.
	 * @param {string} directoryPath The complete path of a directory to check.
	 * @returns {boolean} True if the directory is ignored, false if not. Will
	 * 		return true for any directory that is not inside of `basePath`.
	 * @throws {Error} When the `ConfigArray` is not normalized.
	 */
	isDirectoryIgnored(directoryPath) {

		assertNormalized(this);

		const relativeDirectoryPath = path.relative(this.basePath, directoryPath)
			.replace(/\\/g, '/');

		if (relativeDirectoryPath.startsWith('..')) {
			return true;
		}

		// first check the cache
		const cache = dataCache.get(this).directoryMatches;

		if (cache.has(relativeDirectoryPath)) {
			return cache.get(relativeDirectoryPath);
		}

		const directoryParts = relativeDirectoryPath.split('/');
		let relativeDirectoryToCheck = '';
		let result = false;

		/*
		 * In order to get the correct gitignore-style ignores, where an
		 * ignored parent directory cannot have any descendants unignored,
		 * we need to check every directory starting at the parent all
		 * the way down to the actual requested directory.
		 * 
		 * We aggressively cache all of this info to make sure we don't
		 * have to recalculate everything for every call.
		 */
		do {

			relativeDirectoryToCheck += directoryParts.shift() + '/';

			result = shouldIgnorePath(
				this.ignores,
				path.join(this.basePath, relativeDirectoryToCheck),
				relativeDirectoryToCheck
			);

			cache.set(relativeDirectoryToCheck, result);

		} while (!result && directoryParts.length);

		// also cache the result for the requested path
		cache.set(relativeDirectoryPath, result);

		return result;
	}

}

exports.ConfigArray = ConfigArray;
exports.ConfigArraySymbol = ConfigArraySymbol;
