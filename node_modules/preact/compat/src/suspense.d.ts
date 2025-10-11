// Intentionally not using a relative path to take advantage of
// the TS version resolution mechanism
import { Component, ComponentChild, ComponentChildren } from 'preact';

//
// Suspense/lazy
// -----------------------------------
export function lazy<T>(
	loader: () => Promise<{ default: T } | T>
): T extends { default: infer U } ? U : T;

export interface SuspenseProps {
	children?: ComponentChildren;
	fallback: ComponentChildren;
}

export class Suspense extends Component<SuspenseProps> {
	render(): ComponentChild;
}
