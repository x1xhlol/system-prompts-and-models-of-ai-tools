// Intentionally not using a relative path to take advantage of
// the TS version resolution mechanism
import * as preact from 'preact';

export function createRoot(container: preact.ContainerNode): {
	render(children: preact.ComponentChild): void;
	unmount(): void;
};

export function hydrateRoot(
	container: preact.ContainerNode,
	children: preact.ComponentChild
): ReturnType<typeof createRoot>;
