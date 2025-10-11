import { enqueueRender } from './component';
import { NULL } from './constants';

export let i = 0;

export function createContext(defaultValue) {
	function Context(props) {
		if (!this.getChildContext) {
			/** @type {Set<import('./internal').Component> | null} */
			let subs = new Set();
			let ctx = {};
			ctx[Context._id] = this;

			this.getChildContext = () => ctx;

			this.componentWillUnmount = () => {
				subs = NULL;
			};

			this.shouldComponentUpdate = function (_props) {
				// @ts-expect-error even
				if (this.props.value != _props.value) {
					subs.forEach(c => {
						c._force = true;
						enqueueRender(c);
					});
				}
			};

			this.sub = c => {
				subs.add(c);
				let old = c.componentWillUnmount;
				c.componentWillUnmount = () => {
					if (subs) {
						subs.delete(c);
					}
					if (old) old.call(c);
				};
			};
		}

		return props.children;
	}

	Context._id = '__cC' + i++;
	Context._defaultValue = defaultValue;

	/** @type {import('./internal').FunctionComponent} */
	Context.Consumer = (props, contextValue) => {
		return props.children(contextValue);
	};

	// we could also get rid of _contextRef entirely
	Context.Provider =
		Context._contextRef =
		Context.Consumer.contextType =
			Context;

	return Context;
}
