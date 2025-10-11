import { initDebug } from './debug';
import 'preact/devtools';

initDebug();

export { resetPropWarnings } from './check-props';

export {
	getCurrentVNode,
	getDisplayName,
	getOwnerStack
} from './component-stack';
