import {eastAsianWidth} from 'get-east-asian-width';

export default function isFullwidthCodePoint(codePoint) {
	if (!Number.isInteger(codePoint)) {
		return false;
	}

	return eastAsianWidth(codePoint) === 2;
}
