import { useState, useLayoutEffect, useEffect } from 'preact/hooks';
import { is } from './util';

/**
 * This is taken from https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreShimClient.js#L84
 * on a high level this cuts out the warnings, ... and attempts a smaller implementation
 * @typedef {{ _value: any; _getSnapshot: () => any }} Store
 */
export function useSyncExternalStore(subscribe, getSnapshot) {
	const value = getSnapshot();

	/**
	 * @typedef {{ _instance: Store }} StoreRef
	 * @type {[StoreRef, (store: StoreRef) => void]}
	 */
	const [{ _instance }, forceUpdate] = useState({
		_instance: { _value: value, _getSnapshot: getSnapshot }
	});

	useLayoutEffect(() => {
		_instance._value = value;
		_instance._getSnapshot = getSnapshot;

		if (didSnapshotChange(_instance)) {
			forceUpdate({ _instance });
		}
	}, [subscribe, value, getSnapshot]);

	useEffect(() => {
		if (didSnapshotChange(_instance)) {
			forceUpdate({ _instance });
		}

		return subscribe(() => {
			if (didSnapshotChange(_instance)) {
				forceUpdate({ _instance });
			}
		});
	}, [subscribe]);

	return value;
}

/** @type {(inst: Store) => boolean} */
function didSnapshotChange(inst) {
	const latestGetSnapshot = inst._getSnapshot;
	const prevValue = inst._value;
	try {
		const nextValue = latestGetSnapshot();
		return !is(prevValue, nextValue);
	} catch (error) {
		return true;
	}
}

export function startTransition(cb) {
	cb();
}

export function useDeferredValue(val) {
	return val;
}

export function useTransition() {
	return [false, startTransition];
}

// TODO: in theory this should be done after a VNode is diffed as we want to insert
// styles/... before it attaches
export const useInsertionEffect = useLayoutEffect;
