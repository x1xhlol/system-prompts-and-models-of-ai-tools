"use strict"

Object.defineProperties(exports, {__esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"}})

const dangerouslyDisableDefaultSrc = Symbol("dangerouslyDisableDefaultSrc")
const DEFAULT_DIRECTIVES = {
	"default-src": ["'self'"],
	"base-uri": ["'self'"],
	"font-src": ["'self'", "https:", "data:"],
	"form-action": ["'self'"],
	"frame-ancestors": ["'self'"],
	"img-src": ["'self'", "data:"],
	"object-src": ["'none'"],
	"script-src": ["'self'"],
	"script-src-attr": ["'none'"],
	"style-src": ["'self'", "https:", "'unsafe-inline'"],
	"upgrade-insecure-requests": []
}
const SHOULD_BE_QUOTED = new Set(["none", "self", "strict-dynamic", "report-sample", "inline-speculation-rules", "unsafe-inline", "unsafe-eval", "unsafe-hashes", "wasm-unsafe-eval"])
const getDefaultDirectives = () => Object.assign({}, DEFAULT_DIRECTIVES)
const dashify = str => str.replace(/[A-Z]/g, capitalLetter => "-" + capitalLetter.toLowerCase())
const isDirectiveValueInvalid = directiveValue => /;|,/.test(directiveValue)
const shouldDirectiveValueEntryBeQuoted = directiveValueEntry => SHOULD_BE_QUOTED.has(directiveValueEntry) || directiveValueEntry.startsWith("nonce-") || directiveValueEntry.startsWith("sha256-") || directiveValueEntry.startsWith("sha384-") || directiveValueEntry.startsWith("sha512-")
const warnIfDirectiveValueEntryShouldBeQuoted = value => {
	if (shouldDirectiveValueEntryBeQuoted(value)) {
		console.warn(`Content-Security-Policy got directive value \`${value}\` which should be single-quoted and changed to \`'${value}'\`. This will be an error in future versions of Helmet.`)
	}
}
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
function normalizeDirectives(options) {
	const defaultDirectives = getDefaultDirectives()
	const {useDefaults = true, directives: rawDirectives = defaultDirectives} = options
	const result = new Map()
	const directiveNamesSeen = new Set()
	const directivesExplicitlyDisabled = new Set()
	for (const rawDirectiveName in rawDirectives) {
		if (!has(rawDirectives, rawDirectiveName)) {
			continue
		}
		if (rawDirectiveName.length === 0 || /[^a-zA-Z0-9-]/.test(rawDirectiveName)) {
			throw new Error(`Content-Security-Policy received an invalid directive name ${JSON.stringify(rawDirectiveName)}`)
		}
		const directiveName = dashify(rawDirectiveName)
		if (directiveNamesSeen.has(directiveName)) {
			throw new Error(`Content-Security-Policy received a duplicate directive ${JSON.stringify(directiveName)}`)
		}
		directiveNamesSeen.add(directiveName)
		const rawDirectiveValue = rawDirectives[rawDirectiveName]
		let directiveValue
		if (rawDirectiveValue === null) {
			if (directiveName === "default-src") {
				throw new Error("Content-Security-Policy needs a default-src but it was set to `null`. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.")
			}
			directivesExplicitlyDisabled.add(directiveName)
			continue
		} else if (typeof rawDirectiveValue === "string") {
			directiveValue = [rawDirectiveValue]
		} else if (!rawDirectiveValue) {
			throw new Error(`Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}`)
		} else if (rawDirectiveValue === dangerouslyDisableDefaultSrc) {
			if (directiveName === "default-src") {
				directivesExplicitlyDisabled.add("default-src")
				continue
			} else {
				throw new Error(`Content-Security-Policy: tried to disable ${JSON.stringify(directiveName)} as if it were default-src; simply omit the key`)
			}
		} else {
			directiveValue = rawDirectiveValue
		}
		for (const element of directiveValue) {
			if (typeof element === "string") {
				if (isDirectiveValueInvalid(element)) {
					throw new Error(`Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}`)
				}
				warnIfDirectiveValueEntryShouldBeQuoted(element)
			}
		}
		result.set(directiveName, directiveValue)
	}
	if (useDefaults) {
		Object.entries(defaultDirectives).forEach(([defaultDirectiveName, defaultDirectiveValue]) => {
			if (!result.has(defaultDirectiveName) && !directivesExplicitlyDisabled.has(defaultDirectiveName)) {
				result.set(defaultDirectiveName, defaultDirectiveValue)
			}
		})
	}
	if (!result.size) {
		throw new Error("Content-Security-Policy has no directives. Either set some or disable the header")
	}
	if (!result.has("default-src") && !directivesExplicitlyDisabled.has("default-src")) {
		throw new Error("Content-Security-Policy needs a default-src but none was provided. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.")
	}
	return result
}
function getHeaderValue(req, res, normalizedDirectives) {
	let err
	const result = []
	normalizedDirectives.forEach((rawDirectiveValue, directiveName) => {
		let directiveValue = ""
		for (const element of rawDirectiveValue) {
			if (typeof element === "function") {
				const newElement = element(req, res)
				warnIfDirectiveValueEntryShouldBeQuoted(newElement)
				directiveValue += " " + newElement
			} else {
				directiveValue += " " + element
			}
		}
		if (!directiveValue) {
			result.push(directiveName)
		} else if (isDirectiveValueInvalid(directiveValue)) {
			err = new Error(`Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}`)
		} else {
			result.push(`${directiveName}${directiveValue}`)
		}
	})
	return err ? err : result.join(";")
}
const contentSecurityPolicy = function contentSecurityPolicy(options = {}) {
	const headerName = options.reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy"
	const normalizedDirectives = normalizeDirectives(options)
	return function contentSecurityPolicyMiddleware(req, res, next) {
		const result = getHeaderValue(req, res, normalizedDirectives)
		if (result instanceof Error) {
			next(result)
		} else {
			res.setHeader(headerName, result)
			next()
		}
	}
}
contentSecurityPolicy.getDefaultDirectives = getDefaultDirectives
contentSecurityPolicy.dangerouslyDisableDefaultSrc = dangerouslyDisableDefaultSrc

const ALLOWED_POLICIES$2 = new Set(["require-corp", "credentialless", "unsafe-none"])
function getHeaderValueFromOptions$6({policy = "require-corp"}) {
	if (ALLOWED_POLICIES$2.has(policy)) {
		return policy
	} else {
		throw new Error(`Cross-Origin-Embedder-Policy does not support the ${JSON.stringify(policy)} policy`)
	}
}
function crossOriginEmbedderPolicy(options = {}) {
	const headerValue = getHeaderValueFromOptions$6(options)
	return function crossOriginEmbedderPolicyMiddleware(_req, res, next) {
		res.setHeader("Cross-Origin-Embedder-Policy", headerValue)
		next()
	}
}

const ALLOWED_POLICIES$1 = new Set(["same-origin", "same-origin-allow-popups", "unsafe-none"])
function getHeaderValueFromOptions$5({policy = "same-origin"}) {
	if (ALLOWED_POLICIES$1.has(policy)) {
		return policy
	} else {
		throw new Error(`Cross-Origin-Opener-Policy does not support the ${JSON.stringify(policy)} policy`)
	}
}
function crossOriginOpenerPolicy(options = {}) {
	const headerValue = getHeaderValueFromOptions$5(options)
	return function crossOriginOpenerPolicyMiddleware(_req, res, next) {
		res.setHeader("Cross-Origin-Opener-Policy", headerValue)
		next()
	}
}

const ALLOWED_POLICIES = new Set(["same-origin", "same-site", "cross-origin"])
function getHeaderValueFromOptions$4({policy = "same-origin"}) {
	if (ALLOWED_POLICIES.has(policy)) {
		return policy
	} else {
		throw new Error(`Cross-Origin-Resource-Policy does not support the ${JSON.stringify(policy)} policy`)
	}
}
function crossOriginResourcePolicy(options = {}) {
	const headerValue = getHeaderValueFromOptions$4(options)
	return function crossOriginResourcePolicyMiddleware(_req, res, next) {
		res.setHeader("Cross-Origin-Resource-Policy", headerValue)
		next()
	}
}

function originAgentCluster() {
	return function originAgentClusterMiddleware(_req, res, next) {
		res.setHeader("Origin-Agent-Cluster", "?1")
		next()
	}
}

const ALLOWED_TOKENS = new Set(["no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url", ""])
function getHeaderValueFromOptions$3({policy = ["no-referrer"]}) {
	const tokens = typeof policy === "string" ? [policy] : policy
	if (tokens.length === 0) {
		throw new Error("Referrer-Policy received no policy tokens")
	}
	const tokensSeen = new Set()
	tokens.forEach(token => {
		if (!ALLOWED_TOKENS.has(token)) {
			throw new Error(`Referrer-Policy received an unexpected policy token ${JSON.stringify(token)}`)
		} else if (tokensSeen.has(token)) {
			throw new Error(`Referrer-Policy received a duplicate policy token ${JSON.stringify(token)}`)
		}
		tokensSeen.add(token)
	})
	return tokens.join(",")
}
function referrerPolicy(options = {}) {
	const headerValue = getHeaderValueFromOptions$3(options)
	return function referrerPolicyMiddleware(_req, res, next) {
		res.setHeader("Referrer-Policy", headerValue)
		next()
	}
}

const DEFAULT_MAX_AGE = 180 * 24 * 60 * 60
function parseMaxAge(value = DEFAULT_MAX_AGE) {
	if (value >= 0 && Number.isFinite(value)) {
		return Math.floor(value)
	} else {
		throw new Error(`Strict-Transport-Security: ${JSON.stringify(value)} is not a valid value for maxAge. Please choose a positive integer.`)
	}
}
function getHeaderValueFromOptions$2(options) {
	if ("maxage" in options) {
		throw new Error("Strict-Transport-Security received an unsupported property, `maxage`. Did you mean to pass `maxAge`?")
	}
	if ("includeSubdomains" in options) {
		console.warn('Strict-Transport-Security middleware should use `includeSubDomains` instead of `includeSubdomains`. (The correct one has an uppercase "D".)')
	}
	const directives = [`max-age=${parseMaxAge(options.maxAge)}`]
	if (options.includeSubDomains === undefined || options.includeSubDomains) {
		directives.push("includeSubDomains")
	}
	if (options.preload) {
		directives.push("preload")
	}
	return directives.join("; ")
}
function strictTransportSecurity(options = {}) {
	const headerValue = getHeaderValueFromOptions$2(options)
	return function strictTransportSecurityMiddleware(_req, res, next) {
		res.setHeader("Strict-Transport-Security", headerValue)
		next()
	}
}

function xContentTypeOptions() {
	return function xContentTypeOptionsMiddleware(_req, res, next) {
		res.setHeader("X-Content-Type-Options", "nosniff")
		next()
	}
}

function xDnsPrefetchControl(options = {}) {
	const headerValue = options.allow ? "on" : "off"
	return function xDnsPrefetchControlMiddleware(_req, res, next) {
		res.setHeader("X-DNS-Prefetch-Control", headerValue)
		next()
	}
}

function xDownloadOptions() {
	return function xDownloadOptionsMiddleware(_req, res, next) {
		res.setHeader("X-Download-Options", "noopen")
		next()
	}
}

function getHeaderValueFromOptions$1({action = "sameorigin"}) {
	const normalizedAction = typeof action === "string" ? action.toUpperCase() : action
	switch (normalizedAction) {
		case "SAME-ORIGIN":
			return "SAMEORIGIN"
		case "DENY":
		case "SAMEORIGIN":
			return normalizedAction
		default:
			throw new Error(`X-Frame-Options received an invalid action ${JSON.stringify(action)}`)
	}
}
function xFrameOptions(options = {}) {
	const headerValue = getHeaderValueFromOptions$1(options)
	return function xFrameOptionsMiddleware(_req, res, next) {
		res.setHeader("X-Frame-Options", headerValue)
		next()
	}
}

const ALLOWED_PERMITTED_POLICIES = new Set(["none", "master-only", "by-content-type", "all"])
function getHeaderValueFromOptions({permittedPolicies = "none"}) {
	if (ALLOWED_PERMITTED_POLICIES.has(permittedPolicies)) {
		return permittedPolicies
	} else {
		throw new Error(`X-Permitted-Cross-Domain-Policies does not support ${JSON.stringify(permittedPolicies)}`)
	}
}
function xPermittedCrossDomainPolicies(options = {}) {
	const headerValue = getHeaderValueFromOptions(options)
	return function xPermittedCrossDomainPoliciesMiddleware(_req, res, next) {
		res.setHeader("X-Permitted-Cross-Domain-Policies", headerValue)
		next()
	}
}

function xPoweredBy() {
	return function xPoweredByMiddleware(_req, res, next) {
		res.removeHeader("X-Powered-By")
		next()
	}
}

function xXssProtection() {
	return function xXssProtectionMiddleware(_req, res, next) {
		res.setHeader("X-XSS-Protection", "0")
		next()
	}
}

function getMiddlewareFunctionsFromOptions(options) {
	var _a, _b, _c, _d, _e, _f, _g, _h
	const result = []
	switch (options.contentSecurityPolicy) {
		case undefined:
		case true:
			result.push(contentSecurityPolicy())
			break
		case false:
			break
		default:
			result.push(contentSecurityPolicy(options.contentSecurityPolicy))
			break
	}
	switch (options.crossOriginEmbedderPolicy) {
		case undefined:
		case false:
			break
		case true:
			result.push(crossOriginEmbedderPolicy())
			break
		default:
			result.push(crossOriginEmbedderPolicy(options.crossOriginEmbedderPolicy))
			break
	}
	switch (options.crossOriginOpenerPolicy) {
		case undefined:
		case true:
			result.push(crossOriginOpenerPolicy())
			break
		case false:
			break
		default:
			result.push(crossOriginOpenerPolicy(options.crossOriginOpenerPolicy))
			break
	}
	switch (options.crossOriginResourcePolicy) {
		case undefined:
		case true:
			result.push(crossOriginResourcePolicy())
			break
		case false:
			break
		default:
			result.push(crossOriginResourcePolicy(options.crossOriginResourcePolicy))
			break
	}
	switch (options.originAgentCluster) {
		case undefined:
		case true:
			result.push(originAgentCluster())
			break
		case false:
			break
		default:
			console.warn("Origin-Agent-Cluster does not take options. Remove the property to silence this warning.")
			result.push(originAgentCluster())
			break
	}
	switch (options.referrerPolicy) {
		case undefined:
		case true:
			result.push(referrerPolicy())
			break
		case false:
			break
		default:
			result.push(referrerPolicy(options.referrerPolicy))
			break
	}
	if ("strictTransportSecurity" in options && "hsts" in options) {
		throw new Error("Strict-Transport-Security option was specified twice. Remove `hsts` to silence this warning.")
	}
	const strictTransportSecurityOption = (_a = options.strictTransportSecurity) !== null && _a !== void 0 ? _a : options.hsts
	switch (strictTransportSecurityOption) {
		case undefined:
		case true:
			result.push(strictTransportSecurity())
			break
		case false:
			break
		default:
			result.push(strictTransportSecurity(strictTransportSecurityOption))
			break
	}
	if ("xContentTypeOptions" in options && "noSniff" in options) {
		throw new Error("X-Content-Type-Options option was specified twice. Remove `noSniff` to silence this warning.")
	}
	const xContentTypeOptionsOption = (_b = options.xContentTypeOptions) !== null && _b !== void 0 ? _b : options.noSniff
	switch (xContentTypeOptionsOption) {
		case undefined:
		case true:
			result.push(xContentTypeOptions())
			break
		case false:
			break
		default:
			console.warn("X-Content-Type-Options does not take options. Remove the property to silence this warning.")
			result.push(xContentTypeOptions())
			break
	}
	if ("xDnsPrefetchControl" in options && "dnsPrefetchControl" in options) {
		throw new Error("X-DNS-Prefetch-Control option was specified twice. Remove `dnsPrefetchControl` to silence this warning.")
	}
	const xDnsPrefetchControlOption = (_c = options.xDnsPrefetchControl) !== null && _c !== void 0 ? _c : options.dnsPrefetchControl
	switch (xDnsPrefetchControlOption) {
		case undefined:
		case true:
			result.push(xDnsPrefetchControl())
			break
		case false:
			break
		default:
			result.push(xDnsPrefetchControl(xDnsPrefetchControlOption))
			break
	}
	if ("xDownloadOptions" in options && "ieNoOpen" in options) {
		throw new Error("X-Download-Options option was specified twice. Remove `ieNoOpen` to silence this warning.")
	}
	const xDownloadOptionsOption = (_d = options.xDownloadOptions) !== null && _d !== void 0 ? _d : options.ieNoOpen
	switch (xDownloadOptionsOption) {
		case undefined:
		case true:
			result.push(xDownloadOptions())
			break
		case false:
			break
		default:
			console.warn("X-Download-Options does not take options. Remove the property to silence this warning.")
			result.push(xDownloadOptions())
			break
	}
	if ("xFrameOptions" in options && "frameguard" in options) {
		throw new Error("X-Frame-Options option was specified twice. Remove `frameguard` to silence this warning.")
	}
	const xFrameOptionsOption = (_e = options.xFrameOptions) !== null && _e !== void 0 ? _e : options.frameguard
	switch (xFrameOptionsOption) {
		case undefined:
		case true:
			result.push(xFrameOptions())
			break
		case false:
			break
		default:
			result.push(xFrameOptions(xFrameOptionsOption))
			break
	}
	if ("xPermittedCrossDomainPolicies" in options && "permittedCrossDomainPolicies" in options) {
		throw new Error("X-Permitted-Cross-Domain-Policies option was specified twice. Remove `permittedCrossDomainPolicies` to silence this warning.")
	}
	const xPermittedCrossDomainPoliciesOption = (_f = options.xPermittedCrossDomainPolicies) !== null && _f !== void 0 ? _f : options.permittedCrossDomainPolicies
	switch (xPermittedCrossDomainPoliciesOption) {
		case undefined:
		case true:
			result.push(xPermittedCrossDomainPolicies())
			break
		case false:
			break
		default:
			result.push(xPermittedCrossDomainPolicies(xPermittedCrossDomainPoliciesOption))
			break
	}
	if ("xPoweredBy" in options && "hidePoweredBy" in options) {
		throw new Error("X-Powered-By option was specified twice. Remove `hidePoweredBy` to silence this warning.")
	}
	const xPoweredByOption = (_g = options.xPoweredBy) !== null && _g !== void 0 ? _g : options.hidePoweredBy
	switch (xPoweredByOption) {
		case undefined:
		case true:
			result.push(xPoweredBy())
			break
		case false:
			break
		default:
			console.warn("X-Powered-By does not take options. Remove the property to silence this warning.")
			result.push(xPoweredBy())
			break
	}
	if ("xXssProtection" in options && "xssFilter" in options) {
		throw new Error("X-XSS-Protection option was specified twice. Remove `xssFilter` to silence this warning.")
	}
	const xXssProtectionOption = (_h = options.xXssProtection) !== null && _h !== void 0 ? _h : options.xssFilter
	switch (xXssProtectionOption) {
		case undefined:
		case true:
			result.push(xXssProtection())
			break
		case false:
			break
		default:
			console.warn("X-XSS-Protection does not take options. Remove the property to silence this warning.")
			result.push(xXssProtection())
			break
	}
	return result
}
const helmet = Object.assign(
	function helmet(options = {}) {
		var _a
		// People should be able to pass an options object with no prototype,
		// so we want this optional chaining.
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (((_a = options.constructor) === null || _a === void 0 ? void 0 : _a.name) === "IncomingMessage") {
			throw new Error("It appears you have done something like `app.use(helmet)`, but it should be `app.use(helmet())`.")
		}
		const middlewareFunctions = getMiddlewareFunctionsFromOptions(options)
		return function helmetMiddleware(req, res, next) {
			let middlewareIndex = 0
			;(function internalNext(err) {
				if (err) {
					next(err)
					return
				}
				const middlewareFunction = middlewareFunctions[middlewareIndex]
				if (middlewareFunction) {
					middlewareIndex++
					middlewareFunction(req, res, internalNext)
				} else {
					next()
				}
			})()
		}
	},
	{
		contentSecurityPolicy,
		crossOriginEmbedderPolicy,
		crossOriginOpenerPolicy,
		crossOriginResourcePolicy,
		originAgentCluster,
		referrerPolicy,
		strictTransportSecurity,
		xContentTypeOptions,
		xDnsPrefetchControl,
		xDownloadOptions,
		xFrameOptions,
		xPermittedCrossDomainPolicies,
		xPoweredBy,
		xXssProtection,
		// Legacy aliases
		dnsPrefetchControl: xDnsPrefetchControl,
		xssFilter: xXssProtection,
		permittedCrossDomainPolicies: xPermittedCrossDomainPolicies,
		ieNoOpen: xDownloadOptions,
		noSniff: xContentTypeOptions,
		frameguard: xFrameOptions,
		hidePoweredBy: xPoweredBy,
		hsts: strictTransportSecurity
	}
)

exports.contentSecurityPolicy = contentSecurityPolicy
exports.crossOriginEmbedderPolicy = crossOriginEmbedderPolicy
exports.crossOriginOpenerPolicy = crossOriginOpenerPolicy
exports.crossOriginResourcePolicy = crossOriginResourcePolicy
exports.default = helmet
exports.dnsPrefetchControl = xDnsPrefetchControl
exports.frameguard = xFrameOptions
exports.hidePoweredBy = xPoweredBy
exports.hsts = strictTransportSecurity
exports.ieNoOpen = xDownloadOptions
exports.noSniff = xContentTypeOptions
exports.originAgentCluster = originAgentCluster
exports.permittedCrossDomainPolicies = xPermittedCrossDomainPolicies
exports.referrerPolicy = referrerPolicy
exports.strictTransportSecurity = strictTransportSecurity
exports.xContentTypeOptions = xContentTypeOptions
exports.xDnsPrefetchControl = xDnsPrefetchControl
exports.xDownloadOptions = xDownloadOptions
exports.xFrameOptions = xFrameOptions
exports.xPermittedCrossDomainPolicies = xPermittedCrossDomainPolicies
exports.xPoweredBy = xPoweredBy
exports.xXssProtection = xXssProtection
exports.xssFilter = xXssProtection

module.exports = exports.default
module.exports.default = module.exports
