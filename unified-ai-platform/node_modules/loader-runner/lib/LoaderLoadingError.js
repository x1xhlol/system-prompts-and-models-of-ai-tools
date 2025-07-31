"use strict";

class LoadingLoaderError extends Error {
	constructor(message) {
		super(message);
		this.name = "LoaderRunnerError";
		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = LoadingLoaderError;
