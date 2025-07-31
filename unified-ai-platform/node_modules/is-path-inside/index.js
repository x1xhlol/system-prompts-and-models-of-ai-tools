'use strict';
const path = require('path');

module.exports = (childPath, parentPath) => {
	const relation = path.relative(parentPath, childPath);
	return Boolean(
		relation &&
		relation !== '..' &&
		!relation.startsWith(`..${path.sep}`) &&
		relation !== path.resolve(childPath)
	);
};
