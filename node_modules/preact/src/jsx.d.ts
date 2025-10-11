// Users who only use Preact for SSR might not specify "dom" in their lib in tsconfig.json
/// <reference lib="dom" />

import {
	ClassAttributes,
	Component,
	ComponentType,
	FunctionComponent,
	PreactDOMAttributes,
	VNode
} from 'preact';

type Defaultize<Props, Defaults> =
	// Distribute over unions
	Props extends any // Make any properties included in Default optional
		? Partial<Pick<Props, Extract<keyof Props, keyof Defaults>>> & // Include the remaining properties from Props
				Pick<Props, Exclude<keyof Props, keyof Defaults>>
		: never;

type Booleanish = boolean | 'true' | 'false';

// Remove when bumping TS minimum to >5.2

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ToggleEvent) */
interface ToggleEvent extends Event {
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ToggleEvent/newState) */
	readonly newState: string;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ToggleEvent/oldState) */
	readonly oldState: string;
}

declare var ToggleEvent: {
	prototype: ToggleEvent;
	new (type: string, eventInitDict?: ToggleEventInit): ToggleEvent;
};

interface ToggleEventInit extends EventInit {
	newState?: string;
	oldState?: string;
}

// End TS >5.2

/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/CommandEvent) */
interface CommandEvent extends Event {
	/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/CommandEvent/source) */
	readonly source: Element | null;
	/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/CommandEvent/command) */
	readonly command: string;
}

declare var CommandEvent: {
	prototype: CommandEvent;
	new (type: string, eventInitDict?: CommandEventInit): CommandEvent;
};

interface CommandEventInit extends EventInit {
	source: Element | null;
	command: string;
}

export namespace JSXInternal {
	export type LibraryManagedAttributes<Component, Props> = Component extends {
		defaultProps: infer Defaults;
	}
		? Defaultize<Props, Defaults>
		: Props;

	export interface IntrinsicAttributes {
		key?: any;
	}

	export type ElementType<P = any> =
		| {
				[K in keyof IntrinsicElements]: P extends IntrinsicElements[K]
					? K
					: never;
		  }[keyof IntrinsicElements]
		| ComponentType<P>;
	export interface Element extends VNode<any> {}
	export type ElementClass = Component<any, any> | FunctionComponent<any>;

	export interface ElementAttributesProperty {
		props: any;
	}

	export interface ElementChildrenAttribute {
		children: any;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export type DOMCSSProperties = {
		[key in keyof Omit<
			CSSStyleDeclaration,
			| 'item'
			| 'setProperty'
			| 'removeProperty'
			| 'getPropertyValue'
			| 'getPropertyPriority'
		>]?: string | number | null | undefined;
	};
	/** @deprecated Please import from the Preact namespace instead */
	export type AllCSSProperties = {
		[key: string]: string | number | null | undefined;
	};
	/** @deprecated Please import from the Preact namespace instead */
	export interface CSSProperties extends AllCSSProperties, DOMCSSProperties {
		cssText?: string | null;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface SignalLike<T> {
		value: T;
		peek(): T;
		subscribe(fn: (value: T) => void): () => void;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export type Signalish<T> = T | SignalLike<T>;

	/** @deprecated Please import from the Preact namespace instead */
	export type UnpackSignal<T> = T extends SignalLike<infer V> ? V : T;

	/** @deprecated Please import from the Preact namespace instead */
	export interface SVGAttributes<Target extends EventTarget = SVGElement>
		extends HTMLAttributes<Target> {
		accentHeight?: Signalish<number | string | undefined>;
		accumulate?: Signalish<'none' | 'sum' | undefined>;
		additive?: Signalish<'replace' | 'sum' | undefined>;
		alignmentBaseline?: Signalish<
			| 'auto'
			| 'baseline'
			| 'before-edge'
			| 'text-before-edge'
			| 'middle'
			| 'central'
			| 'after-edge'
			| 'text-after-edge'
			| 'ideographic'
			| 'alphabetic'
			| 'hanging'
			| 'mathematical'
			| 'inherit'
			| undefined
		>;
		'alignment-baseline'?: Signalish<
			| 'auto'
			| 'baseline'
			| 'before-edge'
			| 'text-before-edge'
			| 'middle'
			| 'central'
			| 'after-edge'
			| 'text-after-edge'
			| 'ideographic'
			| 'alphabetic'
			| 'hanging'
			| 'mathematical'
			| 'inherit'
			| undefined
		>;
		allowReorder?: Signalish<'no' | 'yes' | undefined>;
		'allow-reorder'?: Signalish<'no' | 'yes' | undefined>;
		alphabetic?: Signalish<number | string | undefined>;
		amplitude?: Signalish<number | string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/arabic-form */
		arabicForm?: Signalish<
			'initial' | 'medial' | 'terminal' | 'isolated' | undefined
		>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/arabic-form */
		'arabic-form'?: Signalish<
			'initial' | 'medial' | 'terminal' | 'isolated' | undefined
		>;
		ascent?: Signalish<number | string | undefined>;
		attributeName?: Signalish<string | undefined>;
		attributeType?: Signalish<string | undefined>;
		azimuth?: Signalish<number | string | undefined>;
		baseFrequency?: Signalish<number | string | undefined>;
		baselineShift?: Signalish<number | string | undefined>;
		'baseline-shift'?: Signalish<number | string | undefined>;
		baseProfile?: Signalish<number | string | undefined>;
		bbox?: Signalish<number | string | undefined>;
		begin?: Signalish<number | string | undefined>;
		bias?: Signalish<number | string | undefined>;
		by?: Signalish<number | string | undefined>;
		calcMode?: Signalish<number | string | undefined>;
		capHeight?: Signalish<number | string | undefined>;
		'cap-height'?: Signalish<number | string | undefined>;
		clip?: Signalish<number | string | undefined>;
		clipPath?: Signalish<string | undefined>;
		'clip-path'?: Signalish<string | undefined>;
		clipPathUnits?: Signalish<number | string | undefined>;
		clipRule?: Signalish<number | string | undefined>;
		'clip-rule'?: Signalish<number | string | undefined>;
		colorInterpolation?: Signalish<number | string | undefined>;
		'color-interpolation'?: Signalish<number | string | undefined>;
		colorInterpolationFilters?: Signalish<
			'auto' | 'sRGB' | 'linearRGB' | 'inherit' | undefined
		>;
		'color-interpolation-filters'?: Signalish<
			'auto' | 'sRGB' | 'linearRGB' | 'inherit' | undefined
		>;
		colorProfile?: Signalish<number | string | undefined>;
		'color-profile'?: Signalish<number | string | undefined>;
		colorRendering?: Signalish<number | string | undefined>;
		'color-rendering'?: Signalish<number | string | undefined>;
		contentScriptType?: Signalish<number | string | undefined>;
		'content-script-type'?: Signalish<number | string | undefined>;
		contentStyleType?: Signalish<number | string | undefined>;
		'content-style-type'?: Signalish<number | string | undefined>;
		cursor?: Signalish<number | string | undefined>;
		cx?: Signalish<number | string | undefined>;
		cy?: Signalish<number | string | undefined>;
		d?: Signalish<string | undefined>;
		decelerate?: Signalish<number | string | undefined>;
		descent?: Signalish<number | string | undefined>;
		diffuseConstant?: Signalish<number | string | undefined>;
		direction?: Signalish<number | string | undefined>;
		display?: Signalish<number | string | undefined>;
		divisor?: Signalish<number | string | undefined>;
		dominantBaseline?: Signalish<number | string | undefined>;
		'dominant-baseline'?: Signalish<number | string | undefined>;
		dur?: Signalish<number | string | undefined>;
		dx?: Signalish<number | string | undefined>;
		dy?: Signalish<number | string | undefined>;
		edgeMode?: Signalish<number | string | undefined>;
		elevation?: Signalish<number | string | undefined>;
		enableBackground?: Signalish<number | string | undefined>;
		'enable-background'?: Signalish<number | string | undefined>;
		end?: Signalish<number | string | undefined>;
		exponent?: Signalish<number | string | undefined>;
		externalResourcesRequired?: Signalish<number | string | undefined>;
		fill?: Signalish<string | undefined>;
		fillOpacity?: Signalish<number | string | undefined>;
		'fill-opacity'?: Signalish<number | string | undefined>;
		fillRule?: Signalish<'nonzero' | 'evenodd' | 'inherit' | undefined>;
		'fill-rule'?: Signalish<'nonzero' | 'evenodd' | 'inherit' | undefined>;
		filter?: Signalish<string | undefined>;
		filterRes?: Signalish<number | string | undefined>;
		filterUnits?: Signalish<number | string | undefined>;
		floodColor?: Signalish<number | string | undefined>;
		'flood-color'?: Signalish<number | string | undefined>;
		floodOpacity?: Signalish<number | string | undefined>;
		'flood-opacity'?: Signalish<number | string | undefined>;
		focusable?: Signalish<number | string | undefined>;
		fontFamily?: Signalish<string | undefined>;
		'font-family'?: Signalish<string | undefined>;
		fontSize?: Signalish<number | string | undefined>;
		'font-size'?: Signalish<number | string | undefined>;
		fontSizeAdjust?: Signalish<number | string | undefined>;
		'font-size-adjust'?: Signalish<number | string | undefined>;
		fontStretch?: Signalish<number | string | undefined>;
		'font-stretch'?: Signalish<number | string | undefined>;
		fontStyle?: Signalish<number | string | undefined>;
		'font-style'?: Signalish<number | string | undefined>;
		fontVariant?: Signalish<number | string | undefined>;
		'font-variant'?: Signalish<number | string | undefined>;
		fontWeight?: Signalish<number | string | undefined>;
		'font-weight'?: Signalish<number | string | undefined>;
		format?: Signalish<number | string | undefined>;
		from?: Signalish<number | string | undefined>;
		fx?: Signalish<number | string | undefined>;
		fy?: Signalish<number | string | undefined>;
		g1?: Signalish<number | string | undefined>;
		g2?: Signalish<number | string | undefined>;
		glyphName?: Signalish<number | string | undefined>;
		'glyph-name'?: Signalish<number | string | undefined>;
		glyphOrientationHorizontal?: Signalish<number | string | undefined>;
		'glyph-orientation-horizontal'?: Signalish<number | string | undefined>;
		glyphOrientationVertical?: Signalish<number | string | undefined>;
		'glyph-orientation-vertical'?: Signalish<number | string | undefined>;
		glyphRef?: Signalish<number | string | undefined>;
		gradientTransform?: Signalish<string | undefined>;
		gradientUnits?: Signalish<string | undefined>;
		hanging?: Signalish<number | string | undefined>;
		height?: Signalish<number | string | undefined>;
		horizAdvX?: Signalish<number | string | undefined>;
		'horiz-adv-x'?: Signalish<number | string | undefined>;
		horizOriginX?: Signalish<number | string | undefined>;
		'horiz-origin-x'?: Signalish<number | string | undefined>;
		href?: Signalish<string | undefined>;
		hreflang?: Signalish<string | undefined>;
		hrefLang?: Signalish<string | undefined>;
		ideographic?: Signalish<number | string | undefined>;
		imageRendering?: Signalish<number | string | undefined>;
		'image-rendering'?: Signalish<number | string | undefined>;
		in2?: Signalish<number | string | undefined>;
		in?: Signalish<string | undefined>;
		intercept?: Signalish<number | string | undefined>;
		k1?: Signalish<number | string | undefined>;
		k2?: Signalish<number | string | undefined>;
		k3?: Signalish<number | string | undefined>;
		k4?: Signalish<number | string | undefined>;
		k?: Signalish<number | string | undefined>;
		kernelMatrix?: Signalish<number | string | undefined>;
		kernelUnitLength?: Signalish<number | string | undefined>;
		kerning?: Signalish<number | string | undefined>;
		keyPoints?: Signalish<number | string | undefined>;
		keySplines?: Signalish<number | string | undefined>;
		keyTimes?: Signalish<number | string | undefined>;
		lengthAdjust?: Signalish<number | string | undefined>;
		letterSpacing?: Signalish<number | string | undefined>;
		'letter-spacing'?: Signalish<number | string | undefined>;
		lightingColor?: Signalish<number | string | undefined>;
		'lighting-color'?: Signalish<number | string | undefined>;
		limitingConeAngle?: Signalish<number | string | undefined>;
		local?: Signalish<number | string | undefined>;
		markerEnd?: Signalish<string | undefined>;
		'marker-end'?: Signalish<string | undefined>;
		markerHeight?: Signalish<number | string | undefined>;
		markerMid?: Signalish<string | undefined>;
		'marker-mid'?: Signalish<string | undefined>;
		markerStart?: Signalish<string | undefined>;
		'marker-start'?: Signalish<string | undefined>;
		markerUnits?: Signalish<number | string | undefined>;
		markerWidth?: Signalish<number | string | undefined>;
		mask?: Signalish<string | undefined>;
		maskContentUnits?: Signalish<number | string | undefined>;
		maskUnits?: Signalish<number | string | undefined>;
		mathematical?: Signalish<number | string | undefined>;
		mode?: Signalish<number | string | undefined>;
		numOctaves?: Signalish<number | string | undefined>;
		offset?: Signalish<number | string | undefined>;
		opacity?: Signalish<number | string | undefined>;
		operator?: Signalish<number | string | undefined>;
		order?: Signalish<number | string | undefined>;
		orient?: Signalish<number | string | undefined>;
		orientation?: Signalish<number | string | undefined>;
		origin?: Signalish<number | string | undefined>;
		overflow?: Signalish<number | string | undefined>;
		overlinePosition?: Signalish<number | string | undefined>;
		'overline-position'?: Signalish<number | string | undefined>;
		overlineThickness?: Signalish<number | string | undefined>;
		'overline-thickness'?: Signalish<number | string | undefined>;
		paintOrder?: Signalish<number | string | undefined>;
		'paint-order'?: Signalish<number | string | undefined>;
		panose1?: Signalish<number | string | undefined>;
		'panose-1'?: Signalish<number | string | undefined>;
		pathLength?: Signalish<number | string | undefined>;
		patternContentUnits?: Signalish<string | undefined>;
		patternTransform?: Signalish<number | string | undefined>;
		patternUnits?: Signalish<string | undefined>;
		pointerEvents?: Signalish<number | string | undefined>;
		'pointer-events'?: Signalish<number | string | undefined>;
		points?: Signalish<string | undefined>;
		pointsAtX?: Signalish<number | string | undefined>;
		pointsAtY?: Signalish<number | string | undefined>;
		pointsAtZ?: Signalish<number | string | undefined>;
		preserveAlpha?: Signalish<number | string | undefined>;
		preserveAspectRatio?: Signalish<string | undefined>;
		primitiveUnits?: Signalish<number | string | undefined>;
		r?: Signalish<number | string | undefined>;
		radius?: Signalish<number | string | undefined>;
		refX?: Signalish<number | string | undefined>;
		refY?: Signalish<number | string | undefined>;
		renderingIntent?: Signalish<number | string | undefined>;
		'rendering-intent'?: Signalish<number | string | undefined>;
		repeatCount?: Signalish<number | string | undefined>;
		'repeat-count'?: Signalish<number | string | undefined>;
		repeatDur?: Signalish<number | string | undefined>;
		'repeat-dur'?: Signalish<number | string | undefined>;
		requiredExtensions?: Signalish<number | string | undefined>;
		requiredFeatures?: Signalish<number | string | undefined>;
		restart?: Signalish<number | string | undefined>;
		result?: Signalish<string | undefined>;
		rotate?: Signalish<number | string | undefined>;
		rx?: Signalish<number | string | undefined>;
		ry?: Signalish<number | string | undefined>;
		scale?: Signalish<number | string | undefined>;
		seed?: Signalish<number | string | undefined>;
		shapeRendering?: Signalish<number | string | undefined>;
		'shape-rendering'?: Signalish<number | string | undefined>;
		slope?: Signalish<number | string | undefined>;
		spacing?: Signalish<number | string | undefined>;
		specularConstant?: Signalish<number | string | undefined>;
		specularExponent?: Signalish<number | string | undefined>;
		speed?: Signalish<number | string | undefined>;
		spreadMethod?: Signalish<string | undefined>;
		startOffset?: Signalish<number | string | undefined>;
		stdDeviation?: Signalish<number | string | undefined>;
		stemh?: Signalish<number | string | undefined>;
		stemv?: Signalish<number | string | undefined>;
		stitchTiles?: Signalish<number | string | undefined>;
		stopColor?: Signalish<string | undefined>;
		'stop-color'?: Signalish<string | undefined>;
		stopOpacity?: Signalish<number | string | undefined>;
		'stop-opacity'?: Signalish<number | string | undefined>;
		strikethroughPosition?: Signalish<number | string | undefined>;
		'strikethrough-position'?: Signalish<number | string | undefined>;
		strikethroughThickness?: Signalish<number | string | undefined>;
		'strikethrough-thickness'?: Signalish<number | string | undefined>;
		string?: Signalish<number | string | undefined>;
		stroke?: Signalish<string | undefined>;
		strokeDasharray?: Signalish<string | number | undefined>;
		'stroke-dasharray'?: Signalish<string | number | undefined>;
		strokeDashoffset?: Signalish<string | number | undefined>;
		'stroke-dashoffset'?: Signalish<string | number | undefined>;
		strokeLinecap?: Signalish<
			'butt' | 'round' | 'square' | 'inherit' | undefined
		>;
		'stroke-linecap'?: Signalish<
			'butt' | 'round' | 'square' | 'inherit' | undefined
		>;
		strokeLinejoin?: Signalish<
			'miter' | 'round' | 'bevel' | 'inherit' | undefined
		>;
		'stroke-linejoin'?: Signalish<
			'miter' | 'round' | 'bevel' | 'inherit' | undefined
		>;
		strokeMiterlimit?: Signalish<string | number | undefined>;
		'stroke-miterlimit'?: Signalish<string | number | undefined>;
		strokeOpacity?: Signalish<number | string | undefined>;
		'stroke-opacity'?: Signalish<number | string | undefined>;
		strokeWidth?: Signalish<number | string | undefined>;
		'stroke-width'?: Signalish<number | string | undefined>;
		surfaceScale?: Signalish<number | string | undefined>;
		systemLanguage?: Signalish<number | string | undefined>;
		tableValues?: Signalish<number | string | undefined>;
		targetX?: Signalish<number | string | undefined>;
		targetY?: Signalish<number | string | undefined>;
		textAnchor?: Signalish<string | undefined>;
		'text-anchor'?: Signalish<string | undefined>;
		textDecoration?: Signalish<number | string | undefined>;
		'text-decoration'?: Signalish<number | string | undefined>;
		textLength?: Signalish<number | string | undefined>;
		textRendering?: Signalish<number | string | undefined>;
		'text-rendering'?: Signalish<number | string | undefined>;
		to?: Signalish<number | string | undefined>;
		transform?: Signalish<string | undefined>;
		transformOrigin?: Signalish<string | undefined>;
		'transform-origin'?: Signalish<string | undefined>;
		type?: Signalish<string | undefined>;
		u1?: Signalish<number | string | undefined>;
		u2?: Signalish<number | string | undefined>;
		underlinePosition?: Signalish<number | string | undefined>;
		'underline-position'?: Signalish<number | string | undefined>;
		underlineThickness?: Signalish<number | string | undefined>;
		'underline-thickness'?: Signalish<number | string | undefined>;
		unicode?: Signalish<number | string | undefined>;
		unicodeBidi?: Signalish<number | string | undefined>;
		'unicode-bidi'?: Signalish<number | string | undefined>;
		unicodeRange?: Signalish<number | string | undefined>;
		'unicode-range'?: Signalish<number | string | undefined>;
		unitsPerEm?: Signalish<number | string | undefined>;
		'units-per-em'?: Signalish<number | string | undefined>;
		vAlphabetic?: Signalish<number | string | undefined>;
		'v-alphabetic'?: Signalish<number | string | undefined>;
		values?: Signalish<string | undefined>;
		vectorEffect?: Signalish<number | string | undefined>;
		'vector-effect'?: Signalish<number | string | undefined>;
		version?: Signalish<string | undefined>;
		vertAdvY?: Signalish<number | string | undefined>;
		'vert-adv-y'?: Signalish<number | string | undefined>;
		vertOriginX?: Signalish<number | string | undefined>;
		'vert-origin-x'?: Signalish<number | string | undefined>;
		vertOriginY?: Signalish<number | string | undefined>;
		'vert-origin-y'?: Signalish<number | string | undefined>;
		vHanging?: Signalish<number | string | undefined>;
		'v-hanging'?: Signalish<number | string | undefined>;
		vIdeographic?: Signalish<number | string | undefined>;
		'v-ideographic'?: Signalish<number | string | undefined>;
		viewBox?: Signalish<string | undefined>;
		viewTarget?: Signalish<number | string | undefined>;
		visibility?: Signalish<number | string | undefined>;
		vMathematical?: Signalish<number | string | undefined>;
		'v-mathematical'?: Signalish<number | string | undefined>;
		width?: Signalish<number | string | undefined>;
		wordSpacing?: Signalish<number | string | undefined>;
		'word-spacing'?: Signalish<number | string | undefined>;
		writingMode?: Signalish<number | string | undefined>;
		'writing-mode'?: Signalish<number | string | undefined>;
		x1?: Signalish<number | string | undefined>;
		x2?: Signalish<number | string | undefined>;
		x?: Signalish<number | string | undefined>;
		xChannelSelector?: Signalish<string | undefined>;
		xHeight?: Signalish<number | string | undefined>;
		'x-height'?: Signalish<number | string | undefined>;
		xlinkActuate?: Signalish<string | undefined>;
		'xlink:actuate'?: Signalish<SVGAttributes['xlinkActuate']>;
		xlinkArcrole?: Signalish<string | undefined>;
		'xlink:arcrole'?: Signalish<string | undefined>;
		xlinkHref?: Signalish<string | undefined>;
		'xlink:href'?: Signalish<string | undefined>;
		xlinkRole?: Signalish<string | undefined>;
		'xlink:role'?: Signalish<string | undefined>;
		xlinkShow?: Signalish<string | undefined>;
		'xlink:show'?: Signalish<string | undefined>;
		xlinkTitle?: Signalish<string | undefined>;
		'xlink:title'?: Signalish<string | undefined>;
		xlinkType?: Signalish<string | undefined>;
		'xlink:type'?: Signalish<string | undefined>;
		xmlBase?: Signalish<string | undefined>;
		'xml:base'?: Signalish<string | undefined>;
		xmlLang?: Signalish<string | undefined>;
		'xml:lang'?: Signalish<string | undefined>;
		xmlns?: Signalish<string | undefined>;
		xmlnsXlink?: Signalish<string | undefined>;
		xmlSpace?: Signalish<string | undefined>;
		'xml:space'?: Signalish<string | undefined>;
		y1?: Signalish<number | string | undefined>;
		y2?: Signalish<number | string | undefined>;
		y?: Signalish<number | string | undefined>;
		yChannelSelector?: Signalish<string | undefined>;
		z?: Signalish<number | string | undefined>;
		zoomAndPan?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface PathAttributes {
		d: string;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedEvent<
		Target extends EventTarget = EventTarget,
		TypedEvent extends Event = Event
	> = Omit<TypedEvent, 'currentTarget'> & {
		readonly currentTarget: Target;
	};

	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedAnimationEvent<Target extends EventTarget> =
		TargetedEvent<Target, AnimationEvent>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedClipboardEvent<Target extends EventTarget> =
		TargetedEvent<Target, ClipboardEvent>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedCommandEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		CommandEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedCompositionEvent<Target extends EventTarget> =
		TargetedEvent<Target, CompositionEvent>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedDragEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		DragEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedFocusEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		FocusEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedInputEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		InputEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedKeyboardEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		KeyboardEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedMouseEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		MouseEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedPointerEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		PointerEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedSubmitEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		SubmitEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedTouchEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		TouchEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedToggleEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		ToggleEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedTransitionEvent<Target extends EventTarget> =
		TargetedEvent<Target, TransitionEvent>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedUIEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		UIEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedWheelEvent<Target extends EventTarget> = TargetedEvent<
		Target,
		WheelEvent
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TargetedPictureInPictureEvent<Target extends EventTarget> =
		TargetedEvent<Target, PictureInPictureEvent>;

	/** @deprecated Please import from the Preact namespace instead */
	export type EventHandler<E extends TargetedEvent> = {
		bivarianceHack(event: E): void;
	}['bivarianceHack'];

	/** @deprecated Please import from the Preact namespace instead */
	export type AnimationEventHandler<Target extends EventTarget> = EventHandler<
		TargetedAnimationEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type ClipboardEventHandler<Target extends EventTarget> = EventHandler<
		TargetedClipboardEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type CommandEventHandler<Target extends EventTarget> = EventHandler<
		TargetedCommandEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type CompositionEventHandler<Target extends EventTarget> =
		EventHandler<TargetedCompositionEvent<Target>>;
	/** @deprecated Please import from the Preact namespace instead */
	export type DragEventHandler<Target extends EventTarget> = EventHandler<
		TargetedDragEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type ToggleEventHandler<Target extends EventTarget> = EventHandler<
		TargetedToggleEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type FocusEventHandler<Target extends EventTarget> = EventHandler<
		TargetedFocusEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type GenericEventHandler<Target extends EventTarget> = EventHandler<
		TargetedEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type InputEventHandler<Target extends EventTarget> = EventHandler<
		TargetedInputEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type KeyboardEventHandler<Target extends EventTarget> = EventHandler<
		TargetedKeyboardEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type MouseEventHandler<Target extends EventTarget> = EventHandler<
		TargetedMouseEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type PointerEventHandler<Target extends EventTarget> = EventHandler<
		TargetedPointerEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type SubmitEventHandler<Target extends EventTarget> = EventHandler<
		TargetedSubmitEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TouchEventHandler<Target extends EventTarget> = EventHandler<
		TargetedTouchEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type TransitionEventHandler<Target extends EventTarget> = EventHandler<
		TargetedTransitionEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type UIEventHandler<Target extends EventTarget> = EventHandler<
		TargetedUIEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type WheelEventHandler<Target extends EventTarget> = EventHandler<
		TargetedWheelEvent<Target>
	>;
	/** @deprecated Please import from the Preact namespace instead */
	export type PictureInPictureEventHandler<Target extends EventTarget> =
		EventHandler<TargetedPictureInPictureEvent<Target>>;

	/** @deprecated Please import from the Preact namespace instead */
	export interface DOMAttributes<Target extends EventTarget>
		extends PreactDOMAttributes {
		// Image Events
		onLoad?: GenericEventHandler<Target> | undefined;
		onLoadCapture?: GenericEventHandler<Target> | undefined;
		onError?: GenericEventHandler<Target> | undefined;
		onErrorCapture?: GenericEventHandler<Target> | undefined;

		// Clipboard Events
		onCopy?: ClipboardEventHandler<Target> | undefined;
		onCopyCapture?: ClipboardEventHandler<Target> | undefined;
		onCut?: ClipboardEventHandler<Target> | undefined;
		onCutCapture?: ClipboardEventHandler<Target> | undefined;
		onPaste?: ClipboardEventHandler<Target> | undefined;
		onPasteCapture?: ClipboardEventHandler<Target> | undefined;

		// Composition Events
		onCompositionEnd?: CompositionEventHandler<Target> | undefined;
		onCompositionEndCapture?: CompositionEventHandler<Target> | undefined;
		onCompositionStart?: CompositionEventHandler<Target> | undefined;
		onCompositionStartCapture?: CompositionEventHandler<Target> | undefined;
		onCompositionUpdate?: CompositionEventHandler<Target> | undefined;
		onCompositionUpdateCapture?: CompositionEventHandler<Target> | undefined;

		// Popover Events
		onBeforeToggle?: ToggleEventHandler<Target> | undefined;
		onToggle?: ToggleEventHandler<Target> | undefined;

		// Dialog Events
		onClose?: GenericEventHandler<Target> | undefined;
		onCancel?: GenericEventHandler<Target> | undefined;

		// Focus Events
		onFocus?: FocusEventHandler<Target> | undefined;
		onFocusCapture?: FocusEventHandler<Target> | undefined;
		onFocusIn?: FocusEventHandler<Target> | undefined;
		onFocusInCapture?: FocusEventHandler<Target> | undefined;
		onFocusOut?: FocusEventHandler<Target> | undefined;
		onFocusOutCapture?: FocusEventHandler<Target> | undefined;
		onBlur?: FocusEventHandler<Target> | undefined;
		onBlurCapture?: FocusEventHandler<Target> | undefined;

		// Form Events
		onChange?: GenericEventHandler<Target> | undefined;
		onChangeCapture?: GenericEventHandler<Target> | undefined;
		onInput?: InputEventHandler<Target> | undefined;
		onInputCapture?: InputEventHandler<Target> | undefined;
		onBeforeInput?: InputEventHandler<Target> | undefined;
		onBeforeInputCapture?: InputEventHandler<Target> | undefined;
		onSearch?: GenericEventHandler<Target> | undefined;
		onSearchCapture?: GenericEventHandler<Target> | undefined;
		onSubmit?: SubmitEventHandler<Target> | undefined;
		onSubmitCapture?: SubmitEventHandler<Target> | undefined;
		onInvalid?: GenericEventHandler<Target> | undefined;
		onInvalidCapture?: GenericEventHandler<Target> | undefined;
		onReset?: GenericEventHandler<Target> | undefined;
		onResetCapture?: GenericEventHandler<Target> | undefined;
		onFormData?: GenericEventHandler<Target> | undefined;
		onFormDataCapture?: GenericEventHandler<Target> | undefined;

		// Keyboard Events
		onKeyDown?: KeyboardEventHandler<Target> | undefined;
		onKeyDownCapture?: KeyboardEventHandler<Target> | undefined;
		onKeyPress?: KeyboardEventHandler<Target> | undefined;
		onKeyPressCapture?: KeyboardEventHandler<Target> | undefined;
		onKeyUp?: KeyboardEventHandler<Target> | undefined;
		onKeyUpCapture?: KeyboardEventHandler<Target> | undefined;

		// Media Events
		onAbort?: GenericEventHandler<Target> | undefined;
		onAbortCapture?: GenericEventHandler<Target> | undefined;
		onCanPlay?: GenericEventHandler<Target> | undefined;
		onCanPlayCapture?: GenericEventHandler<Target> | undefined;
		onCanPlayThrough?: GenericEventHandler<Target> | undefined;
		onCanPlayThroughCapture?: GenericEventHandler<Target> | undefined;
		onDurationChange?: GenericEventHandler<Target> | undefined;
		onDurationChangeCapture?: GenericEventHandler<Target> | undefined;
		onEmptied?: GenericEventHandler<Target> | undefined;
		onEmptiedCapture?: GenericEventHandler<Target> | undefined;
		onEncrypted?: GenericEventHandler<Target> | undefined;
		onEncryptedCapture?: GenericEventHandler<Target> | undefined;
		onEnded?: GenericEventHandler<Target> | undefined;
		onEndedCapture?: GenericEventHandler<Target> | undefined;
		onLoadedData?: GenericEventHandler<Target> | undefined;
		onLoadedDataCapture?: GenericEventHandler<Target> | undefined;
		onLoadedMetadata?: GenericEventHandler<Target> | undefined;
		onLoadedMetadataCapture?: GenericEventHandler<Target> | undefined;
		onLoadStart?: GenericEventHandler<Target> | undefined;
		onLoadStartCapture?: GenericEventHandler<Target> | undefined;
		onPause?: GenericEventHandler<Target> | undefined;
		onPauseCapture?: GenericEventHandler<Target> | undefined;
		onPlay?: GenericEventHandler<Target> | undefined;
		onPlayCapture?: GenericEventHandler<Target> | undefined;
		onPlaying?: GenericEventHandler<Target> | undefined;
		onPlayingCapture?: GenericEventHandler<Target> | undefined;
		onProgress?: GenericEventHandler<Target> | undefined;
		onProgressCapture?: GenericEventHandler<Target> | undefined;
		onRateChange?: GenericEventHandler<Target> | undefined;
		onRateChangeCapture?: GenericEventHandler<Target> | undefined;
		onSeeked?: GenericEventHandler<Target> | undefined;
		onSeekedCapture?: GenericEventHandler<Target> | undefined;
		onSeeking?: GenericEventHandler<Target> | undefined;
		onSeekingCapture?: GenericEventHandler<Target> | undefined;
		onStalled?: GenericEventHandler<Target> | undefined;
		onStalledCapture?: GenericEventHandler<Target> | undefined;
		onSuspend?: GenericEventHandler<Target> | undefined;
		onSuspendCapture?: GenericEventHandler<Target> | undefined;
		onTimeUpdate?: GenericEventHandler<Target> | undefined;
		onTimeUpdateCapture?: GenericEventHandler<Target> | undefined;
		onVolumeChange?: GenericEventHandler<Target> | undefined;
		onVolumeChangeCapture?: GenericEventHandler<Target> | undefined;
		onWaiting?: GenericEventHandler<Target> | undefined;
		onWaitingCapture?: GenericEventHandler<Target> | undefined;

		// MouseEvents
		onClick?: MouseEventHandler<Target> | undefined;
		onClickCapture?: MouseEventHandler<Target> | undefined;
		onContextMenu?: MouseEventHandler<Target> | undefined;
		onContextMenuCapture?: MouseEventHandler<Target> | undefined;
		onDblClick?: MouseEventHandler<Target> | undefined;
		onDblClickCapture?: MouseEventHandler<Target> | undefined;
		onDrag?: DragEventHandler<Target> | undefined;
		onDragCapture?: DragEventHandler<Target> | undefined;
		onDragEnd?: DragEventHandler<Target> | undefined;
		onDragEndCapture?: DragEventHandler<Target> | undefined;
		onDragEnter?: DragEventHandler<Target> | undefined;
		onDragEnterCapture?: DragEventHandler<Target> | undefined;
		onDragExit?: DragEventHandler<Target> | undefined;
		onDragExitCapture?: DragEventHandler<Target> | undefined;
		onDragLeave?: DragEventHandler<Target> | undefined;
		onDragLeaveCapture?: DragEventHandler<Target> | undefined;
		onDragOver?: DragEventHandler<Target> | undefined;
		onDragOverCapture?: DragEventHandler<Target> | undefined;
		onDragStart?: DragEventHandler<Target> | undefined;
		onDragStartCapture?: DragEventHandler<Target> | undefined;
		onDrop?: DragEventHandler<Target> | undefined;
		onDropCapture?: DragEventHandler<Target> | undefined;
		onMouseDown?: MouseEventHandler<Target> | undefined;
		onMouseDownCapture?: MouseEventHandler<Target> | undefined;
		onMouseEnter?: MouseEventHandler<Target> | undefined;
		onMouseEnterCapture?: MouseEventHandler<Target> | undefined;
		onMouseLeave?: MouseEventHandler<Target> | undefined;
		onMouseLeaveCapture?: MouseEventHandler<Target> | undefined;
		onMouseMove?: MouseEventHandler<Target> | undefined;
		onMouseMoveCapture?: MouseEventHandler<Target> | undefined;
		onMouseOut?: MouseEventHandler<Target> | undefined;
		onMouseOutCapture?: MouseEventHandler<Target> | undefined;
		onMouseOver?: MouseEventHandler<Target> | undefined;
		onMouseOverCapture?: MouseEventHandler<Target> | undefined;
		onMouseUp?: MouseEventHandler<Target> | undefined;
		onMouseUpCapture?: MouseEventHandler<Target> | undefined;
		// TODO: Spec for `auxclick` events was changed to make it a PointerEvent but only
		// Chrome has support for it yet. When more browsers align we should change this.
		// https://developer.mozilla.org/en-US/docs/Web/API/Element/auxclick_event#browser_compatibility
		onAuxClick?: MouseEventHandler<Target> | undefined;
		onAuxClickCapture?: MouseEventHandler<Target> | undefined;

		// Selection Events
		onSelect?: GenericEventHandler<Target> | undefined;
		onSelectCapture?: GenericEventHandler<Target> | undefined;

		// Touch Events
		onTouchCancel?: TouchEventHandler<Target> | undefined;
		onTouchCancelCapture?: TouchEventHandler<Target> | undefined;
		onTouchEnd?: TouchEventHandler<Target> | undefined;
		onTouchEndCapture?: TouchEventHandler<Target> | undefined;
		onTouchMove?: TouchEventHandler<Target> | undefined;
		onTouchMoveCapture?: TouchEventHandler<Target> | undefined;
		onTouchStart?: TouchEventHandler<Target> | undefined;
		onTouchStartCapture?: TouchEventHandler<Target> | undefined;

		// Pointer Events
		onPointerOver?: PointerEventHandler<Target> | undefined;
		onPointerOverCapture?: PointerEventHandler<Target> | undefined;
		onPointerEnter?: PointerEventHandler<Target> | undefined;
		onPointerEnterCapture?: PointerEventHandler<Target> | undefined;
		onPointerDown?: PointerEventHandler<Target> | undefined;
		onPointerDownCapture?: PointerEventHandler<Target> | undefined;
		onPointerMove?: PointerEventHandler<Target> | undefined;
		onPointerMoveCapture?: PointerEventHandler<Target> | undefined;
		onPointerUp?: PointerEventHandler<Target> | undefined;
		onPointerUpCapture?: PointerEventHandler<Target> | undefined;
		onPointerCancel?: PointerEventHandler<Target> | undefined;
		onPointerCancelCapture?: PointerEventHandler<Target> | undefined;
		onPointerOut?: PointerEventHandler<Target> | undefined;
		onPointerOutCapture?: PointerEventHandler<Target> | undefined;
		onPointerLeave?: PointerEventHandler<Target> | undefined;
		onPointerLeaveCapture?: PointerEventHandler<Target> | undefined;
		onGotPointerCapture?: PointerEventHandler<Target> | undefined;
		onGotPointerCaptureCapture?: PointerEventHandler<Target> | undefined;
		onLostPointerCapture?: PointerEventHandler<Target> | undefined;
		onLostPointerCaptureCapture?: PointerEventHandler<Target> | undefined;

		// UI Events
		onScroll?: UIEventHandler<Target> | undefined;
		onScrollEnd?: UIEventHandler<Target> | undefined;
		onScrollCapture?: UIEventHandler<Target> | undefined;

		// Wheel Events
		onWheel?: WheelEventHandler<Target> | undefined;
		onWheelCapture?: WheelEventHandler<Target> | undefined;

		// Animation Events
		onAnimationStart?: AnimationEventHandler<Target> | undefined;
		onAnimationStartCapture?: AnimationEventHandler<Target> | undefined;
		onAnimationEnd?: AnimationEventHandler<Target> | undefined;
		onAnimationEndCapture?: AnimationEventHandler<Target> | undefined;
		onAnimationIteration?: AnimationEventHandler<Target> | undefined;
		onAnimationIterationCapture?: AnimationEventHandler<Target> | undefined;

		// Transition Events
		onTransitionCancel?: TransitionEventHandler<Target>;
		onTransitionCancelCapture?: TransitionEventHandler<Target>;
		onTransitionEnd?: TransitionEventHandler<Target>;
		onTransitionEndCapture?: TransitionEventHandler<Target>;
		onTransitionRun?: TransitionEventHandler<Target>;
		onTransitionRunCapture?: TransitionEventHandler<Target>;
		onTransitionStart?: TransitionEventHandler<Target>;
		onTransitionStartCapture?: TransitionEventHandler<Target>;

		// PictureInPicture Events
		onEnterPictureInPicture?: PictureInPictureEventHandler<Target>;
		onEnterPictureInPictureCapture?: PictureInPictureEventHandler<Target>;
		onLeavePictureInPicture?: PictureInPictureEventHandler<Target>;
		onLeavePictureInPictureCapture?: PictureInPictureEventHandler<Target>;
		onResize?: PictureInPictureEventHandler<Target>;
		onResizeCapture?: PictureInPictureEventHandler<Target>;

		onCommand?: CommandEventHandler<Target>;
	}

	// All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
	/** @deprecated Please import from the Preact namespace instead */
	export interface AriaAttributes {
		/** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
		'aria-activedescendant'?: Signalish<string | undefined>;
		/** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
		'aria-atomic'?: Signalish<Booleanish | undefined>;
		/**
		 * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
		 * presented if they are made.
		 */
		'aria-autocomplete'?: Signalish<
			'none' | 'inline' | 'list' | 'both' | undefined
		>;
		/**
		 * Defines a string value that labels the current element, which is intended to be converted into Braille.
		 * @see aria-label.
		 */
		'aria-braillelabel'?: Signalish<string | undefined>;
		/**
		 * Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille.
		 * @see aria-roledescription.
		 */
		'aria-brailleroledescription'?: Signalish<string | undefined>;
		/** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
		'aria-busy'?: Signalish<Booleanish | undefined>;
		/**
		 * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
		 * @see aria-pressed
		 * @see aria-selected.
		 */
		'aria-checked'?: Signalish<Booleanish | 'mixed' | undefined>;
		/**
		 * Defines the total number of columns in a table, grid, or treegrid.
		 * @see aria-colindex.
		 */
		'aria-colcount'?: Signalish<number | undefined>;
		/**
		 * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
		 * @see aria-colcount
		 * @see aria-colspan.
		 */
		'aria-colindex'?: Signalish<number | undefined>;
		/**
		 * Defines a human readable text alternative of aria-colindex.
		 * @see aria-rowindextext.
		 */
		'aria-colindextext'?: Signalish<string | undefined>;
		/**
		 * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
		 * @see aria-colindex
		 * @see aria-rowspan.
		 */
		'aria-colspan'?: Signalish<number | undefined>;
		/**
		 * Identifies the element (or elements) whose contents or presence are controlled by the current element.
		 * @see aria-owns.
		 */
		'aria-controls'?: Signalish<string | undefined>;
		/** Indicates the element that represents the current item within a container or set of related elements. */
		'aria-current'?: Signalish<
			Booleanish | 'page' | 'step' | 'location' | 'date' | 'time' | undefined
		>;
		/**
		 * Identifies the element (or elements) that describes the object.
		 * @see aria-labelledby
		 */
		'aria-describedby'?: Signalish<string | undefined>;
		/**
		 * Defines a string value that describes or annotates the current element.
		 * @see related aria-describedby.
		 */
		'aria-description'?: Signalish<string | undefined>;
		/**
		 * Identifies the element that provides a detailed, extended description for the object.
		 * @see aria-describedby.
		 */
		'aria-details'?: Signalish<string | undefined>;
		/**
		 * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
		 * @see aria-hidden
		 * @see aria-readonly.
		 */
		'aria-disabled'?: Signalish<Booleanish | undefined>;
		/**
		 * Indicates what functions can be performed when a dragged object is released on the drop target.
		 * @deprecated in ARIA 1.1
		 */
		'aria-dropeffect'?: Signalish<
			'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup' | undefined
		>;
		/**
		 * Identifies the element that provides an error message for the object.
		 * @see aria-invalid
		 * @see aria-describedby.
		 */
		'aria-errormessage'?: Signalish<string | undefined>;
		/** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
		'aria-expanded'?: Signalish<Booleanish | undefined>;
		/**
		 * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
		 * allows assistive technology to override the general default of reading in document source order.
		 */
		'aria-flowto'?: Signalish<string | undefined>;
		/**
		 * Indicates an element's "grabbed" state in a drag-and-drop operation.
		 * @deprecated in ARIA 1.1
		 */
		'aria-grabbed'?: Signalish<Booleanish | undefined>;
		/** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
		'aria-haspopup'?: Signalish<
			Booleanish | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | undefined
		>;
		/**
		 * Indicates whether the element is exposed to an accessibility API.
		 * @see aria-disabled.
		 */
		'aria-hidden'?: Signalish<Booleanish | undefined>;
		/**
		 * Indicates the entered value does not conform to the format expected by the application.
		 * @see aria-errormessage.
		 */
		'aria-invalid'?: Signalish<Booleanish | 'grammar' | 'spelling' | undefined>;
		/** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
		'aria-keyshortcuts'?: Signalish<string | undefined>;
		/**
		 * Defines a string value that labels the current element.
		 * @see aria-labelledby.
		 */
		'aria-label'?: Signalish<string | undefined>;
		/**
		 * Identifies the element (or elements) that labels the current element.
		 * @see aria-describedby.
		 */
		'aria-labelledby'?: Signalish<string | undefined>;
		/** Defines the hierarchical level of an element within a structure. */
		'aria-level'?: Signalish<number | undefined>;
		/** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
		'aria-live'?: Signalish<'off' | 'assertive' | 'polite' | undefined>;
		/** Indicates whether an element is modal when displayed. */
		'aria-modal'?: Signalish<Booleanish | undefined>;
		/** Indicates whether a text box accepts multiple lines of input or only a single line. */
		'aria-multiline'?: Signalish<Booleanish | undefined>;
		/** Indicates that the user may select more than one item from the current selectable descendants. */
		'aria-multiselectable'?: Signalish<Booleanish | undefined>;
		/** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
		'aria-orientation'?: Signalish<'horizontal' | 'vertical' | undefined>;
		/**
		 * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
		 * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
		 * @see aria-controls.
		 */
		'aria-owns'?: Signalish<string | undefined>;
		/**
		 * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
		 * A hint could be a sample value or a brief description of the expected format.
		 */
		'aria-placeholder'?: Signalish<string | undefined>;
		/**
		 * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
		 * @see aria-setsize.
		 */
		'aria-posinset'?: Signalish<number | undefined>;
		/**
		 * Indicates the current "pressed" state of toggle buttons.
		 * @see aria-checked
		 * @see aria-selected.
		 */
		'aria-pressed'?: Signalish<Booleanish | 'mixed' | undefined>;
		/**
		 * Indicates that the element is not editable, but is otherwise operable.
		 * @see aria-disabled.
		 */
		'aria-readonly'?: Signalish<Booleanish | undefined>;
		/**
		 * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
		 * @see aria-atomic.
		 */
		'aria-relevant'?: Signalish<
			| 'additions'
			| 'additions removals'
			| 'additions text'
			| 'all'
			| 'removals'
			| 'removals additions'
			| 'removals text'
			| 'text'
			| 'text additions'
			| 'text removals'
			| undefined
		>;
		/** Indicates that user input is required on the element before a form may be submitted. */
		'aria-required'?: Signalish<Booleanish | undefined>;
		/** Defines a human-readable, author-localized description for the role of an element. */
		'aria-roledescription'?: Signalish<string | undefined>;
		/**
		 * Defines the total number of rows in a table, grid, or treegrid.
		 * @see aria-rowindex.
		 */
		'aria-rowcount'?: Signalish<number | undefined>;
		/**
		 * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
		 * @see aria-rowcount
		 * @see aria-rowspan.
		 */
		'aria-rowindex'?: Signalish<number | undefined>;
		/**
		 * Defines a human readable text alternative of aria-rowindex.
		 * @see aria-colindextext.
		 */
		'aria-rowindextext'?: Signalish<string | undefined>;
		/**
		 * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
		 * @see aria-rowindex
		 * @see aria-colspan.
		 */
		'aria-rowspan'?: Signalish<number | undefined>;
		/**
		 * Indicates the current "selected" state of various widgets.
		 * @see aria-checked
		 * @see aria-pressed.
		 */
		'aria-selected'?: Signalish<Booleanish | undefined>;
		/**
		 * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
		 * @see aria-posinset.
		 */
		'aria-setsize'?: Signalish<number | undefined>;
		/** Indicates if items in a table or grid are sorted in ascending or descending order. */
		'aria-sort'?: Signalish<
			'none' | 'ascending' | 'descending' | 'other' | undefined
		>;
		/** Defines the maximum allowed value for a range widget. */
		'aria-valuemax'?: Signalish<number | undefined>;
		/** Defines the minimum allowed value for a range widget. */
		'aria-valuemin'?: Signalish<number | undefined>;
		/**
		 * Defines the current value for a range widget.
		 * @see aria-valuetext.
		 */
		'aria-valuenow'?: Signalish<number | undefined>;
		/** Defines the human readable text alternative of aria-valuenow for a range widget. */
		'aria-valuetext'?: Signalish<string | undefined>;
	}

	// All the WAI-ARIA 1.2 role attribute values from https://www.w3.org/TR/wai-aria-1.2/#role_definitions
	/** @deprecated Please import from the Preact namespace instead */
	export type WAIAriaRole =
		| 'alert'
		| 'alertdialog'
		| 'application'
		| 'article'
		| 'banner'
		| 'blockquote'
		| 'button'
		| 'caption'
		| 'cell'
		| 'checkbox'
		| 'code'
		| 'columnheader'
		| 'combobox'
		| 'command'
		| 'complementary'
		| 'composite'
		| 'contentinfo'
		| 'definition'
		| 'deletion'
		| 'dialog'
		| 'directory'
		| 'document'
		| 'emphasis'
		| 'feed'
		| 'figure'
		| 'form'
		| 'grid'
		| 'gridcell'
		| 'group'
		| 'heading'
		| 'img'
		| 'input'
		| 'insertion'
		| 'landmark'
		| 'link'
		| 'list'
		| 'listbox'
		| 'listitem'
		| 'log'
		| 'main'
		| 'marquee'
		| 'math'
		| 'meter'
		| 'menu'
		| 'menubar'
		| 'menuitem'
		| 'menuitemcheckbox'
		| 'menuitemradio'
		| 'navigation'
		| 'none'
		| 'note'
		| 'option'
		| 'paragraph'
		| 'presentation'
		| 'progressbar'
		| 'radio'
		| 'radiogroup'
		| 'range'
		| 'region'
		| 'roletype'
		| 'row'
		| 'rowgroup'
		| 'rowheader'
		| 'scrollbar'
		| 'search'
		| 'searchbox'
		| 'section'
		| 'sectionhead'
		| 'select'
		| 'separator'
		| 'slider'
		| 'spinbutton'
		| 'status'
		| 'strong'
		| 'structure'
		| 'subscript'
		| 'superscript'
		| 'switch'
		| 'tab'
		| 'table'
		| 'tablist'
		| 'tabpanel'
		| 'term'
		| 'textbox'
		| 'time'
		| 'timer'
		| 'toolbar'
		| 'tooltip'
		| 'tree'
		| 'treegrid'
		| 'treeitem'
		| 'widget'
		| 'window'
		| 'none presentation';

	// All the Digital Publishing WAI-ARIA 1.0 role attribute values from https://www.w3.org/TR/dpub-aria-1.0/#role_definitions
	/** @deprecated Please import from the Preact namespace instead */
	export type DPubAriaRole =
		| 'doc-abstract'
		| 'doc-acknowledgments'
		| 'doc-afterword'
		| 'doc-appendix'
		| 'doc-backlink'
		| 'doc-biblioentry'
		| 'doc-bibliography'
		| 'doc-biblioref'
		| 'doc-chapter'
		| 'doc-colophon'
		| 'doc-conclusion'
		| 'doc-cover'
		| 'doc-credit'
		| 'doc-credits'
		| 'doc-dedication'
		| 'doc-endnote'
		| 'doc-endnotes'
		| 'doc-epigraph'
		| 'doc-epilogue'
		| 'doc-errata'
		| 'doc-example'
		| 'doc-footnote'
		| 'doc-foreword'
		| 'doc-glossary'
		| 'doc-glossref'
		| 'doc-index'
		| 'doc-introduction'
		| 'doc-noteref'
		| 'doc-notice'
		| 'doc-pagebreak'
		| 'doc-pagelist'
		| 'doc-part'
		| 'doc-preface'
		| 'doc-prologue'
		| 'doc-pullquote'
		| 'doc-qna'
		| 'doc-subtitle'
		| 'doc-tip'
		| 'doc-toc';

	/** @deprecated Please import from the Preact namespace instead */
	export type AriaRole = WAIAriaRole | DPubAriaRole;

	/** @deprecated Please import from the Preact namespace instead */
	export interface AllHTMLAttributes<RefType extends EventTarget = EventTarget>
		extends ClassAttributes<RefType>,
			DOMAttributes<RefType>,
			AriaAttributes {
		// Standard HTML Attributes
		accept?: Signalish<string | undefined>;
		acceptCharset?: Signalish<string | undefined>;
		'accept-charset'?: Signalish<AllHTMLAttributes['acceptCharset']>;
		accessKey?: Signalish<string | undefined>;
		accesskey?: Signalish<AllHTMLAttributes['accessKey']>;
		action?: Signalish<string | undefined>;
		allow?: Signalish<string | undefined>;
		allowFullScreen?: Signalish<boolean | undefined>;
		allowTransparency?: Signalish<boolean | undefined>;
		alt?: Signalish<string | undefined>;
		as?: Signalish<string | undefined>;
		async?: Signalish<boolean | undefined>;
		autocomplete?: Signalish<string | undefined>;
		autoComplete?: Signalish<string | undefined>;
		autocorrect?: Signalish<string | undefined>;
		autoCorrect?: Signalish<string | undefined>;
		autofocus?: Signalish<boolean | undefined>;
		autoFocus?: Signalish<boolean | undefined>;
		autoPlay?: Signalish<boolean | undefined>;
		autoplay?: Signalish<boolean | undefined>;
		capture?: Signalish<boolean | string | undefined>;
		cellPadding?: Signalish<number | string | undefined>;
		cellSpacing?: Signalish<number | string | undefined>;
		charSet?: Signalish<string | undefined>;
		charset?: Signalish<string | undefined>;
		challenge?: Signalish<string | undefined>;
		checked?: Signalish<boolean | undefined>;
		cite?: Signalish<string | undefined>;
		class?: Signalish<string | undefined>;
		className?: Signalish<string | undefined>;
		cols?: Signalish<number | undefined>;
		colSpan?: Signalish<number | undefined>;
		colspan?: Signalish<number | undefined>;
		content?: Signalish<string | undefined>;
		contentEditable?: Signalish<
			Booleanish | '' | 'plaintext-only' | 'inherit' | undefined
		>;
		contenteditable?: Signalish<AllHTMLAttributes['contentEditable']>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contextmenu */
		contextMenu?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contextmenu */
		contextmenu?: Signalish<string | undefined>;
		controls?: Signalish<boolean | undefined>;
		controlslist?: Signalish<string | undefined>;
		controlsList?: Signalish<string | undefined>;
		coords?: Signalish<string | undefined>;
		crossOrigin?: Signalish<string | undefined>;
		crossorigin?: Signalish<string | undefined>;
		currentTime?: Signalish<number | undefined>;
		data?: Signalish<string | undefined>;
		dateTime?: Signalish<string | undefined>;
		datetime?: Signalish<string | undefined>;
		default?: Signalish<boolean | undefined>;
		defaultChecked?: Signalish<boolean | undefined>;
		defaultMuted?: Signalish<boolean | undefined>;
		defaultPlaybackRate?: Signalish<number | undefined>;
		defaultValue?: Signalish<string | undefined>;
		defer?: Signalish<boolean | undefined>;
		dir?: Signalish<'auto' | 'rtl' | 'ltr' | undefined>;
		disabled?: Signalish<boolean | undefined>;
		disableremoteplayback?: Signalish<boolean | undefined>;
		disableRemotePlayback?: Signalish<boolean | undefined>;
		download?: Signalish<any | undefined>;
		decoding?: Signalish<'sync' | 'async' | 'auto' | undefined>;
		draggable?: Signalish<boolean | undefined>;
		encType?: Signalish<string | undefined>;
		enctype?: Signalish<string | undefined>;
		enterkeyhint?: Signalish<
			| 'enter'
			| 'done'
			| 'go'
			| 'next'
			| 'previous'
			| 'search'
			| 'send'
			| undefined
		>;
		elementTiming?: Signalish<string | undefined>;
		elementtiming?: Signalish<AllHTMLAttributes['elementTiming']>;
		exportparts?: Signalish<string | undefined>;
		for?: Signalish<string | undefined>;
		form?: Signalish<string | undefined>;
		formAction?: Signalish<string | undefined>;
		formaction?: Signalish<string | undefined>;
		formEncType?: Signalish<string | undefined>;
		formenctype?: Signalish<string | undefined>;
		formMethod?: Signalish<string | undefined>;
		formmethod?: Signalish<string | undefined>;
		formNoValidate?: Signalish<boolean | undefined>;
		formnovalidate?: Signalish<boolean | undefined>;
		formTarget?: Signalish<string | undefined>;
		formtarget?: Signalish<string | undefined>;
		frameBorder?: Signalish<number | string | undefined>;
		frameborder?: Signalish<number | string | undefined>;
		headers?: Signalish<string | undefined>;
		height?: Signalish<number | string | undefined>;
		hidden?: Signalish<boolean | 'hidden' | 'until-found' | undefined>;
		high?: Signalish<number | undefined>;
		href?: Signalish<string | undefined>;
		hrefLang?: Signalish<string | undefined>;
		hreflang?: Signalish<string | undefined>;
		htmlFor?: Signalish<string | undefined>;
		httpEquiv?: Signalish<string | undefined>;
		'http-equiv'?: Signalish<string | undefined>;
		icon?: Signalish<string | undefined>;
		id?: Signalish<string | undefined>;
		indeterminate?: Signalish<boolean | undefined>;
		inert?: Signalish<boolean | undefined>;
		inputMode?: Signalish<string | undefined>;
		inputmode?: Signalish<string | undefined>;
		integrity?: Signalish<string | undefined>;
		is?: Signalish<string | undefined>;
		keyParams?: Signalish<string | undefined>;
		keyType?: Signalish<string | undefined>;
		kind?: Signalish<string | undefined>;
		label?: Signalish<string | undefined>;
		lang?: Signalish<string | undefined>;
		list?: Signalish<string | undefined>;
		loading?: Signalish<'eager' | 'lazy' | undefined>;
		loop?: Signalish<boolean | undefined>;
		low?: Signalish<number | undefined>;
		manifest?: Signalish<string | undefined>;
		marginHeight?: Signalish<number | undefined>;
		marginWidth?: Signalish<number | undefined>;
		max?: Signalish<number | string | undefined>;
		maxLength?: Signalish<number | undefined>;
		maxlength?: Signalish<number | undefined>;
		media?: Signalish<string | undefined>;
		mediaGroup?: Signalish<string | undefined>;
		method?: Signalish<string | undefined>;
		min?: Signalish<number | string | undefined>;
		minLength?: Signalish<number | undefined>;
		minlength?: Signalish<number | undefined>;
		multiple?: Signalish<boolean | undefined>;
		muted?: Signalish<boolean | undefined>;
		name?: Signalish<string | undefined>;
		nomodule?: Signalish<boolean | undefined>;
		nonce?: Signalish<string | undefined>;
		noValidate?: Signalish<boolean | undefined>;
		novalidate?: Signalish<boolean | undefined>;
		open?: Signalish<boolean | undefined>;
		optimum?: Signalish<number | undefined>;
		part?: Signalish<string | undefined>;
		pattern?: Signalish<string | undefined>;
		ping?: Signalish<string | undefined>;
		placeholder?: Signalish<string | undefined>;
		playsInline?: Signalish<boolean | undefined>;
		playsinline?: Signalish<boolean | undefined>;
		playbackRate?: Signalish<number | undefined>;
		popover?: Signalish<'auto' | 'hint' | 'manual' | boolean | undefined>;
		popovertarget?: Signalish<string | undefined>;
		popoverTarget?: Signalish<string | undefined>;
		popovertargetaction?: Signalish<'hide' | 'show' | 'toggle' | undefined>;
		popoverTargetAction?: Signalish<'hide' | 'show' | 'toggle' | undefined>;
		poster?: Signalish<string | undefined>;
		preload?: Signalish<'auto' | 'metadata' | 'none' | undefined>;
		preservesPitch?: Signalish<boolean | undefined>;
		radioGroup?: Signalish<string | undefined>;
		readonly?: Signalish<boolean | undefined>;
		readOnly?: Signalish<boolean | undefined>;
		referrerpolicy?: Signalish<
			| 'no-referrer'
			| 'no-referrer-when-downgrade'
			| 'origin'
			| 'origin-when-cross-origin'
			| 'same-origin'
			| 'strict-origin'
			| 'strict-origin-when-cross-origin'
			| 'unsafe-url'
			| undefined
		>;
		rel?: Signalish<string | undefined>;
		required?: Signalish<boolean | undefined>;
		reversed?: Signalish<boolean | undefined>;
		role?: Signalish<AriaRole | undefined>;
		rows?: Signalish<number | undefined>;
		rowSpan?: Signalish<number | undefined>;
		rowspan?: Signalish<number | undefined>;
		sandbox?: Signalish<string | undefined>;
		scope?: Signalish<string | undefined>;
		scoped?: Signalish<boolean | undefined>;
		scrolling?: Signalish<string | undefined>;
		seamless?: Signalish<boolean | undefined>;
		selected?: Signalish<boolean | undefined>;
		shape?: Signalish<string | undefined>;
		size?: Signalish<number | undefined>;
		sizes?: Signalish<string | undefined>;
		slot?: Signalish<string | undefined>;
		span?: Signalish<number | undefined>;
		spellcheck?: Signalish<boolean | undefined>;
		src?: Signalish<string | undefined>;
		srcDoc?: Signalish<string | undefined>;
		srcdoc?: Signalish<string | undefined>;
		srcLang?: Signalish<string | undefined>;
		srclang?: Signalish<string | undefined>;
		srcSet?: Signalish<string | undefined>;
		srcset?: Signalish<string | undefined>;
		srcObject?: Signalish<MediaStream | MediaSource | Blob | File | null>;
		start?: Signalish<number | undefined>;
		step?: Signalish<number | string | undefined>;
		style?: Signalish<string | CSSProperties | undefined>;
		summary?: Signalish<string | undefined>;
		tabIndex?: Signalish<number | undefined>;
		tabindex?: Signalish<number | undefined>;
		target?: Signalish<string | undefined>;
		title?: Signalish<string | undefined>;
		type?: Signalish<string | undefined>;
		useMap?: Signalish<string | undefined>;
		usemap?: Signalish<string | undefined>;
		value?: Signalish<string | string[] | number | undefined>;
		volume?: Signalish<string | number | undefined>;
		width?: Signalish<number | string | undefined>;
		wmode?: Signalish<string | undefined>;
		wrap?: Signalish<string | undefined>;

		// Non-standard Attributes
		autocapitalize?: Signalish<
			'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters' | undefined
		>;
		autoCapitalize?: Signalish<
			'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters' | undefined
		>;
		disablePictureInPicture?: Signalish<boolean | undefined>;
		results?: Signalish<number | undefined>;
		translate?: Signalish<boolean | undefined>;

		// RDFa Attributes
		about?: Signalish<string | undefined>;
		datatype?: Signalish<string | undefined>;
		inlist?: Signalish<any>;
		prefix?: Signalish<string | undefined>;
		property?: Signalish<string | undefined>;
		resource?: Signalish<string | undefined>;
		typeof?: Signalish<string | undefined>;
		vocab?: Signalish<string | undefined>;

		// Microdata Attributes
		itemProp?: Signalish<string | undefined>;
		itemprop?: Signalish<string | undefined>;
		itemScope?: Signalish<boolean | undefined>;
		itemscope?: Signalish<boolean | undefined>;
		itemType?: Signalish<string | undefined>;
		itemtype?: Signalish<string | undefined>;
		itemID?: Signalish<string | undefined>;
		itemid?: Signalish<string | undefined>;
		itemRef?: Signalish<string | undefined>;
		itemref?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface HTMLAttributes<RefType extends EventTarget = EventTarget>
		extends ClassAttributes<RefType>,
			DOMAttributes<RefType>,
			AriaAttributes {
		// Standard HTML Attributes
		accesskey?: Signalish<string | undefined>;
		accessKey?: Signalish<string | undefined>;
		autocapitalize?: Signalish<
			'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters' | undefined
		>;
		autoCapitalize?: Signalish<
			'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters' | undefined
		>;
		autocorrect?: Signalish<string | undefined>;
		autoCorrect?: Signalish<string | undefined>;
		autofocus?: Signalish<boolean | undefined>;
		autoFocus?: Signalish<boolean | undefined>;
		class?: Signalish<string | undefined>;
		className?: Signalish<string | undefined>;
		contenteditable?: Signalish<
			Booleanish | '' | 'plaintext-only' | 'inherit' | undefined
		>;
		contentEditable?: Signalish<
			Booleanish | '' | 'plaintext-only' | 'inherit' | undefined
		>;
		dir?: Signalish<'auto' | 'rtl' | 'ltr' | undefined>;
		draggable?: Signalish<boolean | undefined>;
		enterkeyhint?: Signalish<
			| 'enter'
			| 'done'
			| 'go'
			| 'next'
			| 'previous'
			| 'search'
			| 'send'
			| undefined
		>;
		exportparts?: Signalish<string | undefined>;
		hidden?: Signalish<boolean | 'hidden' | 'until-found' | undefined>;
		id?: Signalish<string | undefined>;
		inert?: Signalish<boolean | undefined>;
		inputmode?: Signalish<string | undefined>;
		inputMode?: Signalish<string | undefined>;
		is?: Signalish<string | undefined>;
		lang?: Signalish<string | undefined>;
		nonce?: Signalish<string | undefined>;
		part?: Signalish<string | undefined>;
		popover?: Signalish<'auto' | 'hint' | 'manual' | boolean | undefined>;
		slot?: Signalish<string | undefined>;
		spellcheck?: Signalish<boolean | undefined>;
		style?: Signalish<string | CSSProperties | undefined>;
		tabindex?: Signalish<number | undefined>;
		tabIndex?: Signalish<number | undefined>;
		title?: Signalish<string | undefined>;
		translate?: Signalish<boolean | undefined>;

		// WAI-ARIA Attributes
		role?: Signalish<AriaRole | undefined>;

		// Non-standard Attributes
		disablePictureInPicture?: Signalish<boolean | undefined>;
		elementtiming?: Signalish<string | undefined>;
		elementTiming?: Signalish<string | undefined>;
		results?: Signalish<number | undefined>;

		// RDFa Attributes
		about?: Signalish<string | undefined>;
		datatype?: Signalish<string | undefined>;
		inlist?: Signalish<any>;
		prefix?: Signalish<string | undefined>;
		property?: Signalish<string | undefined>;
		resource?: Signalish<string | undefined>;
		typeof?: Signalish<string | undefined>;
		vocab?: Signalish<string | undefined>;

		// Microdata Attributes
		itemid?: Signalish<string | undefined>;
		itemID?: Signalish<string | undefined>;
		itemprop?: Signalish<string | undefined>;
		itemProp?: Signalish<string | undefined>;
		itemref?: Signalish<string | undefined>;
		itemRef?: Signalish<string | undefined>;
		itemscope?: Signalish<boolean | undefined>;
		itemScope?: Signalish<boolean | undefined>;
		itemtype?: Signalish<string | undefined>;
		itemType?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	type HTMLAttributeReferrerPolicy =
		| ''
		| 'no-referrer'
		| 'no-referrer-when-downgrade'
		| 'origin'
		| 'origin-when-cross-origin'
		| 'same-origin'
		| 'strict-origin'
		| 'strict-origin-when-cross-origin'
		| 'unsafe-url';

	/** @deprecated Please import from the Preact namespace instead */
	type HTMLAttributeAnchorTarget =
		| '_self'
		| '_blank'
		| '_parent'
		| '_top'
		| (string & {});

	/** @deprecated Please import from the Preact namespace instead */
	interface AnchorHTMLAttributes<T extends EventTarget = HTMLAnchorElement>
		extends HTMLAttributes<T> {
		download?: Signalish<any>;
		href?: Signalish<string | undefined>;
		hreflang?: Signalish<string | undefined>;
		hrefLang?: Signalish<string | undefined>;
		media?: Signalish<string | undefined>;
		ping?: Signalish<string | undefined>;
		rel?: Signalish<string | undefined>;
		target?: Signalish<HTMLAttributeAnchorTarget | undefined>;
		type?: Signalish<string | undefined>;
		referrerpolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
		referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface AreaHTMLAttributes<T extends EventTarget = HTMLAreaElement>
		extends HTMLAttributes<T> {
		alt?: Signalish<string | undefined>;
		coords?: Signalish<string | undefined>;
		download?: Signalish<any>;
		href?: Signalish<string | undefined>;
		hreflang?: Signalish<string | undefined>;
		hrefLang?: Signalish<string | undefined>;
		media?: Signalish<string | undefined>;
		referrerpolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
		referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
		rel?: Signalish<string | undefined>;
		shape?: Signalish<string | undefined>;
		target?: Signalish<HTMLAttributeAnchorTarget | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface AudioHTMLAttributes<T extends EventTarget = HTMLAudioElement>
		extends MediaHTMLAttributes<T> {}

	/** @deprecated Please import from the Preact namespace instead */
	interface BaseHTMLAttributes<T extends EventTarget = HTMLBaseElement>
		extends HTMLAttributes<T> {
		href?: Signalish<string | undefined>;
		target?: Signalish<HTMLAttributeAnchorTarget | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface BlockquoteHTMLAttributes<T extends EventTarget = HTMLQuoteElement>
		extends HTMLAttributes<T> {
		cite?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface ButtonHTMLAttributes<T extends EventTarget = HTMLButtonElement>
		extends HTMLAttributes<T> {
		command?: Signalish<string | undefined>;
		commandfor?: Signalish<string | undefined>;
		commandFor?: Signalish<string | undefined>;
		disabled?: Signalish<boolean | undefined>;
		form?: Signalish<string | undefined>;
		formaction?: Signalish<string | undefined>;
		formAction?: Signalish<string | undefined>;
		formenctype?: Signalish<string | undefined>;
		formEncType?: Signalish<string | undefined>;
		formmethod?: Signalish<string | undefined>;
		formMethod?: Signalish<string | undefined>;
		formnovalidate?: Signalish<boolean | undefined>;
		formNoValidate?: Signalish<boolean | undefined>;
		formtarget?: Signalish<string | undefined>;
		formTarget?: Signalish<string | undefined>;
		name?: Signalish<string | undefined>;
		popovertarget?: Signalish<string | undefined>;
		popoverTarget?: Signalish<string | undefined>;
		popovertargetaction?: Signalish<'hide' | 'show' | 'toggle' | undefined>;
		popoverTargetAction?: Signalish<'hide' | 'show' | 'toggle' | undefined>;
		type?: Signalish<'submit' | 'reset' | 'button' | undefined>;
		value?: Signalish<string | number | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface CanvasHTMLAttributes<T extends EventTarget = HTMLCanvasElement>
		extends HTMLAttributes<T> {
		height?: Signalish<number | string | undefined>;
		width?: Signalish<number | string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface ColHTMLAttributes<T extends EventTarget = HTMLTableColElement>
		extends HTMLAttributes<T> {
		span?: Signalish<number | undefined>;
		width?: Signalish<number | string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface ColgroupHTMLAttributes<T extends EventTarget = HTMLTableColElement>
		extends HTMLAttributes<T> {
		span?: Signalish<number | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface DataHTMLAttributes<T extends EventTarget = HTMLDataElement>
		extends HTMLAttributes<T> {
		value?: Signalish<string | number | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface DelHTMLAttributes<T extends EventTarget = HTMLModElement>
		extends HTMLAttributes<T> {
		cite?: Signalish<string | undefined>;
		datetime?: Signalish<string | undefined>;
		dateTime?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface DetailsHTMLAttributes<T extends EventTarget = HTMLDetailsElement>
		extends HTMLAttributes<T> {
		name?: Signalish<string | undefined>;
		open?: Signalish<boolean | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface DialogHTMLAttributes<T extends EventTarget = HTMLDialogElement>
		extends HTMLAttributes<T> {
		onCancel?: GenericEventHandler<T> | undefined;
		onClose?: GenericEventHandler<T> | undefined;
		open?: Signalish<boolean | undefined>;
		closedby?: Signalish<'none' | 'closerequest' | 'any' | undefined>;
		closedBy?: Signalish<'none' | 'closerequest' | 'any' | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface EmbedHTMLAttributes<T extends EventTarget = HTMLEmbedElement>
		extends HTMLAttributes<T> {
		height?: Signalish<number | string | undefined>;
		src?: Signalish<string | undefined>;
		type?: Signalish<string | undefined>;
		width?: Signalish<number | string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface FieldsetHTMLAttributes<T extends EventTarget = HTMLFieldSetElement>
		extends HTMLAttributes<T> {
		disabled?: Signalish<boolean | undefined>;
		form?: Signalish<string | undefined>;
		name?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface FormHTMLAttributes<T extends EventTarget = HTMLFormElement>
		extends HTMLAttributes<T> {
		'accept-charset'?: Signalish<string | undefined>;
		acceptCharset?: Signalish<string | undefined>;
		action?: Signalish<string | undefined>;
		autocomplete?: Signalish<string | undefined>;
		autoComplete?: Signalish<string | undefined>;
		enctype?: Signalish<string | undefined>;
		encType?: Signalish<string | undefined>;
		method?: Signalish<string | undefined>;
		name?: Signalish<string | undefined>;
		novalidate?: Signalish<boolean | undefined>;
		noValidate?: Signalish<boolean | undefined>;
		rel?: Signalish<string | undefined>;
		target?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface IframeHTMLAttributes<T extends EventTarget = HTMLIFrameElement>
		extends HTMLAttributes<T> {
		allow?: Signalish<string | undefined>;
		allowFullScreen?: Signalish<boolean | undefined>;
		allowTransparency?: Signalish<boolean | undefined>;
		/** @deprecated */
		frameborder?: Signalish<number | string | undefined>;
		/** @deprecated */
		frameBorder?: Signalish<number | string | undefined>;
		height?: Signalish<number | string | undefined>;
		loading?: Signalish<'eager' | 'lazy' | undefined>;
		/** @deprecated */
		marginHeight?: Signalish<number | undefined>;
		/** @deprecated */
		marginWidth?: Signalish<number | undefined>;
		name?: Signalish<string | undefined>;
		referrerpolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
		referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
		sandbox?: Signalish<string | undefined>;
		/** @deprecated */
		scrolling?: Signalish<string | undefined>;
		seamless?: Signalish<boolean | undefined>;
		src?: Signalish<string | undefined>;
		srcdoc?: Signalish<string | undefined>;
		srcDoc?: Signalish<string | undefined>;
		width?: Signalish<number | string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	type HTMLAttributeCrossOrigin = 'anonymous' | 'use-credentials';

	/** @deprecated Please import from the Preact namespace instead */
	interface ImgHTMLAttributes<T extends EventTarget = HTMLImageElement>
		extends HTMLAttributes<T> {
		alt?: Signalish<string | undefined>;
		crossorigin?: Signalish<HTMLAttributeCrossOrigin>;
		crossOrigin?: Signalish<HTMLAttributeCrossOrigin>;
		decoding?: Signalish<'async' | 'auto' | 'sync' | undefined>;
		fetchpriority?: Signalish<'high' | 'auto' | 'low' | undefined>;
		fetchPriority?: Signalish<'high' | 'auto' | 'low' | undefined>;
		height?: Signalish<number | string | undefined>;
		loading?: Signalish<'eager' | 'lazy' | undefined>;
		referrerpolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
		referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
		sizes?: Signalish<string | undefined>;
		src?: Signalish<string | undefined>;
		srcset?: Signalish<string | undefined>;
		srcSet?: Signalish<string | undefined>;
		usemap?: Signalish<string | undefined>;
		useMap?: Signalish<string | undefined>;
		width?: Signalish<number | string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	type HTMLInputTypeAttribute =
		| 'button'
		| 'checkbox'
		| 'color'
		| 'date'
		| 'datetime-local'
		| 'email'
		| 'file'
		| 'hidden'
		| 'image'
		| 'month'
		| 'number'
		| 'password'
		| 'radio'
		| 'range'
		| 'reset'
		| 'search'
		| 'submit'
		| 'tel'
		| 'text'
		| 'time'
		| 'url'
		| 'week'
		| (string & {});

	/** @deprecated Please import from the Preact namespace instead */
	interface InputHTMLAttributes<T extends EventTarget = HTMLInputElement>
		extends HTMLAttributes<T> {
		accept?: Signalish<string | undefined>;
		alt?: Signalish<string | undefined>;
		autocomplete?: Signalish<string | undefined>;
		autoComplete?: Signalish<string | undefined>;
		capture?: Signalish<'user' | 'environment' | undefined>; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
		checked?: Signalish<boolean | undefined>;
		defaultChecked?: Signalish<boolean | undefined>;
		defaultValue?: Signalish<string | number | undefined>;
		disabled?: Signalish<boolean | undefined>;
		enterKeyHint?: Signalish<
			| 'enter'
			| 'done'
			| 'go'
			| 'next'
			| 'previous'
			| 'search'
			| 'send'
			| undefined
		>;
		form?: Signalish<string | undefined>;
		formaction?: Signalish<string | undefined>;
		formAction?: Signalish<string | undefined>;
		formenctype?: Signalish<string | undefined>;
		formEncType?: Signalish<string | undefined>;
		formmethod?: Signalish<string | undefined>;
		formMethod?: Signalish<string | undefined>;
		formnovalidate?: Signalish<boolean | undefined>;
		formNoValidate?: Signalish<boolean | undefined>;
		formtarget?: Signalish<string | undefined>;
		formTarget?: Signalish<string | undefined>;
		height?: Signalish<number | string | undefined>;
		indeterminate?: Signalish<boolean | undefined>;
		list?: Signalish<string | undefined>;
		max?: Signalish<number | string | undefined>;
		maxlength?: Signalish<number | undefined>;
		maxLength?: Signalish<number | undefined>;
		min?: Signalish<number | string | undefined>;
		minlength?: Signalish<number | undefined>;
		minLength?: Signalish<number | undefined>;
		multiple?: Signalish<boolean | undefined>;
		name?: Signalish<string | undefined>;
		pattern?: Signalish<string | undefined>;
		placeholder?: Signalish<string | undefined>;
		readonly?: Signalish<boolean | undefined>;
		readOnly?: Signalish<boolean | undefined>;
		required?: Signalish<boolean | undefined>;
		size?: Signalish<number | undefined>;
		src?: Signalish<string | undefined>;
		step?: Signalish<number | string | undefined>;
		type?: HTMLInputTypeAttribute | undefined;
		value?: Signalish<string | number | undefined>;
		width?: Signalish<number | string | undefined>;
		onChange?: GenericEventHandler<T> | undefined;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface InsHTMLAttributes<T extends EventTarget = HTMLModElement>
		extends HTMLAttributes<T> {
		cite?: Signalish<string | undefined>;
		datetime?: Signalish<string | undefined>;
		dateTime?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface KeygenHTMLAttributes<T extends EventTarget = HTMLUnknownElement>
		extends HTMLAttributes<T> {
		challenge?: Signalish<string | undefined>;
		disabled?: Signalish<boolean | undefined>;
		form?: Signalish<string | undefined>;
		keyType?: Signalish<string | undefined>;
		keyParams?: Signalish<string | undefined>;
		name?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface LabelHTMLAttributes<T extends EventTarget = HTMLLabelElement>
		extends HTMLAttributes<T> {
		for?: Signalish<string | undefined>;
		form?: Signalish<string | undefined>;
		htmlFor?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface LiHTMLAttributes<T extends EventTarget = HTMLLIElement>
		extends HTMLAttributes<T> {
		value?: Signalish<string | number | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface LinkHTMLAttributes<T extends EventTarget = HTMLLinkElement>
		extends HTMLAttributes<T> {
		as?: Signalish<string | undefined>;
		crossorigin?: Signalish<HTMLAttributeCrossOrigin>;
		crossOrigin?: Signalish<HTMLAttributeCrossOrigin>;
		fetchpriority?: Signalish<'high' | 'low' | 'auto' | undefined>;
		fetchPriority?: Signalish<'high' | 'low' | 'auto' | undefined>;
		href?: Signalish<string | undefined>;
		hreflang?: Signalish<string | undefined>;
		hrefLang?: Signalish<string | undefined>;
		integrity?: Signalish<string | undefined>;
		media?: Signalish<string | undefined>;
		imageSrcSet?: Signalish<string | undefined>;
		referrerpolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
		referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
		rel?: Signalish<string | undefined>;
		sizes?: Signalish<string | undefined>;
		type?: Signalish<string | undefined>;
		charset?: Signalish<string | undefined>;
		charSet?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface MapHTMLAttributes<T extends EventTarget = HTMLMapElement>
		extends HTMLAttributes<T> {
		name?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface MarqueeHTMLAttributes<T extends EventTarget = HTMLMarqueeElement>
		extends HTMLAttributes<T> {
		behavior?: Signalish<'scroll' | 'slide' | 'alternate' | undefined>;
		bgColor?: Signalish<string | undefined>;
		direction?: Signalish<'left' | 'right' | 'up' | 'down' | undefined>;
		height?: Signalish<number | string | undefined>;
		hspace?: Signalish<number | string | undefined>;
		loop?: Signalish<number | string | undefined>;
		scrollAmount?: Signalish<number | string | undefined>;
		scrollDelay?: Signalish<number | string | undefined>;
		trueSpeed?: Signalish<boolean | undefined>;
		vspace?: Signalish<number | string | undefined>;
		width?: Signalish<number | string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface MediaHTMLAttributes<T extends EventTarget = HTMLMediaElement>
		extends HTMLAttributes<T> {
		autoplay?: Signalish<boolean | undefined>;
		autoPlay?: Signalish<boolean | undefined>;
		controls?: Signalish<boolean | undefined>;
		controlslist?: Signalish<string | undefined>;
		controlsList?: Signalish<string | undefined>;
		crossorigin?: Signalish<HTMLAttributeCrossOrigin>;
		crossOrigin?: Signalish<HTMLAttributeCrossOrigin>;
		currentTime?: Signalish<number | undefined>;
		defaultMuted?: Signalish<boolean | undefined>;
		defaultPlaybackRate?: Signalish<number | undefined>;
		disableremoteplayback?: Signalish<boolean | undefined>;
		disableRemotePlayback?: Signalish<boolean | undefined>;
		loop?: Signalish<boolean | undefined>;
		mediaGroup?: Signalish<string | undefined>;
		muted?: Signalish<boolean | undefined>;
		playbackRate?: Signalish<number | undefined>;
		preload?: Signalish<'auto' | 'metadata' | 'none' | undefined>;
		preservesPitch?: Signalish<boolean | undefined>;
		src?: Signalish<string | undefined>;
		srcObject?: Signalish<MediaStream | MediaSource | Blob | File | null>;
		volume?: Signalish<string | number | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface MenuHTMLAttributes<T extends EventTarget = HTMLMenuElement>
		extends HTMLAttributes<T> {
		type?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface MetaHTMLAttributes<T extends EventTarget = HTMLMetaElement>
		extends HTMLAttributes<T> {
		charset?: Signalish<string | undefined>;
		charSet?: Signalish<string | undefined>;
		content?: Signalish<string | undefined>;
		'http-equiv'?: Signalish<string | undefined>;
		httpEquiv?: Signalish<string | undefined>;
		name?: Signalish<string | undefined>;
		media?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface MeterHTMLAttributes<T extends EventTarget = HTMLMeterElement>
		extends HTMLAttributes<T> {
		form?: Signalish<string | undefined>;
		high?: Signalish<number | undefined>;
		low?: Signalish<number | undefined>;
		max?: Signalish<number | string | undefined>;
		min?: Signalish<number | string | undefined>;
		optimum?: Signalish<number | undefined>;
		value?: Signalish<string | number | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface ObjectHTMLAttributes<T extends EventTarget = HTMLObjectElement>
		extends HTMLAttributes<T> {
		classID?: Signalish<string | undefined>;
		data?: Signalish<string | undefined>;
		form?: Signalish<string | undefined>;
		height?: Signalish<number | string | undefined>;
		name?: Signalish<string | undefined>;
		type?: Signalish<string | undefined>;
		usemap?: Signalish<string | undefined>;
		useMap?: Signalish<string | undefined>;
		width?: Signalish<number | string | undefined>;
		wmode?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface OlHTMLAttributes<T extends EventTarget = HTMLOListElement>
		extends HTMLAttributes<T> {
		reversed?: Signalish<boolean | undefined>;
		start?: Signalish<number | undefined>;
		type?: Signalish<'1' | 'a' | 'A' | 'i' | 'I' | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface OptgroupHTMLAttributes<T extends EventTarget = HTMLOptGroupElement>
		extends HTMLAttributes<T> {
		disabled?: Signalish<boolean | undefined>;
		label?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface OptionHTMLAttributes<T extends EventTarget = HTMLOptionElement>
		extends HTMLAttributes<T> {
		disabled?: Signalish<boolean | undefined>;
		label?: Signalish<string | undefined>;
		selected?: Signalish<boolean | undefined>;
		value?: Signalish<string | number | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface OutputHTMLAttributes<T extends EventTarget = HTMLOutputElement>
		extends HTMLAttributes<T> {
		for?: Signalish<string | undefined>;
		form?: Signalish<string | undefined>;
		htmlFor?: Signalish<string | undefined>;
		name?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface ParamHTMLAttributes<T extends EventTarget = HTMLParamElement>
		extends HTMLAttributes<T> {
		name?: Signalish<string | undefined>;
		value?: Signalish<string | number | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface ProgressHTMLAttributes<T extends EventTarget = HTMLProgressElement>
		extends HTMLAttributes<T> {
		max?: Signalish<number | string | undefined>;
		value?: Signalish<string | number | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface QuoteHTMLAttributes<T extends EventTarget = HTMLQuoteElement>
		extends HTMLAttributes<T> {
		cite?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface ScriptHTMLAttributes<T extends EventTarget = HTMLScriptElement>
		extends HTMLAttributes<T> {
		async?: Signalish<boolean | undefined>;
		/** @deprecated */
		charset?: Signalish<string | undefined>;
		/** @deprecated */
		charSet?: Signalish<string | undefined>;
		crossorigin?: Signalish<HTMLAttributeCrossOrigin>;
		crossOrigin?: Signalish<HTMLAttributeCrossOrigin>;
		defer?: Signalish<boolean | undefined>;
		integrity?: Signalish<string | undefined>;
		nomodule?: Signalish<boolean | undefined>;
		noModule?: Signalish<boolean | undefined>;
		referrerpolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
		referrerPolicy?: Signalish<HTMLAttributeReferrerPolicy | undefined>;
		src?: Signalish<string | undefined>;
		type?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface SelectHTMLAttributes<T extends EventTarget = HTMLSelectElement>
		extends HTMLAttributes<T> {
		autocomplete?: Signalish<string | undefined>;
		autoComplete?: Signalish<string | undefined>;
		defaultValue?: Signalish<string | number | undefined>;
		disabled?: Signalish<boolean | undefined>;
		form?: Signalish<string | undefined>;
		multiple?: Signalish<boolean | undefined>;
		name?: Signalish<string | undefined>;
		required?: Signalish<boolean | undefined>;
		size?: Signalish<number | undefined>;
		value?: Signalish<string | number | undefined>;
		onChange?: GenericEventHandler<T> | undefined;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface SlotHTMLAttributes<T extends EventTarget = HTMLSlotElement>
		extends HTMLAttributes<T> {
		name?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface SourceHTMLAttributes<T extends EventTarget = HTMLSourceElement>
		extends HTMLAttributes<T> {
		height?: Signalish<number | string | undefined>;
		media?: Signalish<string | undefined>;
		sizes?: Signalish<string | undefined>;
		src?: Signalish<string | undefined>;
		srcset?: Signalish<string | undefined>;
		srcSet?: Signalish<string | undefined>;
		type?: Signalish<string | undefined>;
		width?: Signalish<number | string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface StyleHTMLAttributes<T extends EventTarget = HTMLStyleElement>
		extends HTMLAttributes<T> {
		media?: Signalish<string | undefined>;
		scoped?: Signalish<boolean | undefined>;
		type?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface TableHTMLAttributes<T extends EventTarget = HTMLTableElement>
		extends HTMLAttributes<T> {
		cellPadding?: Signalish<string | undefined>;
		cellSpacing?: Signalish<string | undefined>;
		summary?: Signalish<string | undefined>;
		width?: Signalish<number | string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface TdHTMLAttributes<T extends EventTarget = HTMLTableCellElement>
		extends HTMLAttributes<T> {
		align?: Signalish<
			'left' | 'center' | 'right' | 'justify' | 'char' | undefined
		>;
		colspan?: Signalish<number | undefined>;
		colSpan?: Signalish<number | undefined>;
		headers?: Signalish<string | undefined>;
		rowspan?: Signalish<number | undefined>;
		rowSpan?: Signalish<number | undefined>;
		scope?: Signalish<string | undefined>;
		abbr?: Signalish<string | undefined>;
		height?: Signalish<number | string | undefined>;
		width?: Signalish<number | string | undefined>;
		valign?: Signalish<'top' | 'middle' | 'bottom' | 'baseline' | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface TextareaHTMLAttributes<T extends EventTarget = HTMLTextAreaElement>
		extends HTMLAttributes<T> {
		autocomplete?: Signalish<string | undefined>;
		autoComplete?: Signalish<string | undefined>;
		cols?: Signalish<number | undefined>;
		defaultValue?: Signalish<string | number | undefined>;
		dirName?: Signalish<string | undefined>;
		disabled?: Signalish<boolean | undefined>;
		form?: Signalish<string | undefined>;
		maxlength?: Signalish<number | undefined>;
		maxLength?: Signalish<number | undefined>;
		minlength?: Signalish<number | undefined>;
		minLength?: Signalish<number | undefined>;
		name?: Signalish<string | undefined>;
		placeholder?: Signalish<string | undefined>;
		readOnly?: Signalish<boolean | undefined>;
		required?: Signalish<boolean | undefined>;
		rows?: Signalish<number | undefined>;
		value?: Signalish<string | number | undefined>;
		wrap?: Signalish<string | undefined>;
		onChange?: GenericEventHandler<T> | undefined;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface ThHTMLAttributes<T extends EventTarget = HTMLTableCellElement>
		extends HTMLAttributes<T> {
		align?: Signalish<
			'left' | 'center' | 'right' | 'justify' | 'char' | undefined
		>;
		colspan?: Signalish<number | undefined>;
		colSpan?: Signalish<number | undefined>;
		headers?: Signalish<string | undefined>;
		rowspan?: Signalish<number | undefined>;
		rowSpan?: Signalish<number | undefined>;
		scope?: Signalish<string | undefined>;
		abbr?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface TimeHTMLAttributes<T extends EventTarget = HTMLTimeElement>
		extends HTMLAttributes<T> {
		datetime?: Signalish<string | undefined>;
		dateTime?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface TrackHTMLAttributes<T extends EventTarget = HTMLTrackElement>
		extends MediaHTMLAttributes<T> {
		default?: Signalish<boolean | undefined>;
		kind?: Signalish<string | undefined>;
		label?: Signalish<string | undefined>;
		srclang?: Signalish<string | undefined>;
		srcLang?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	interface VideoHTMLAttributes<T extends EventTarget = HTMLVideoElement>
		extends MediaHTMLAttributes<T> {
		disablePictureInPicture?: Signalish<boolean | undefined>;
		height?: Signalish<number | string | undefined>;
		playsinline?: Signalish<boolean | undefined>;
		playsInline?: Signalish<boolean | undefined>;
		poster?: Signalish<string | undefined>;
		width?: Signalish<number | string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export type DetailedHTMLProps<
		HA extends HTMLAttributes<RefType>,
		RefType extends EventTarget = EventTarget
	> = HA;

	/** @deprecated Please import from the Preact namespace instead */
	export interface MathMLAttributes<Target extends EventTarget = MathMLElement>
		extends HTMLAttributes<Target> {
		dir?: Signalish<'ltr' | 'rtl' | undefined>;
		displaystyle?: Signalish<boolean | undefined>;
		/** @deprecated This feature is non-standard. See https://developer.mozilla.org/en-US/docs/Web/MathML/Global_attributes/href  */
		href?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Global_attributes/mathbackground */
		mathbackground?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Global_attributes/mathcolor */
		mathcolor?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Global_attributes/mathsize */
		mathsize?: Signalish<string | undefined>;
		nonce?: Signalish<string | undefined>;
		scriptlevel?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface AnnotationMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		encoding?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/semantics#src */
		src?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface AnnotationXmlMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		encoding?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/semantics#src */
		src?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MActionMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/maction#actiontype */
		actiontype?: Signalish<'statusline' | 'toggle' | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/maction#selection */
		selection?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MathMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		display?: Signalish<'block' | 'inline' | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MEncloseMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		notation?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MErrorMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MFencedMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		close?: Signalish<string | undefined>;
		open?: Signalish<string | undefined>;
		separators?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MFracMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mfrac#denomalign */
		denomalign?: Signalish<'center' | 'left' | 'right' | undefined>;
		linethickness?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mfrac#numalign */
		numalign?: Signalish<'center' | 'left' | 'right' | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MiMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** The only value allowed in the current specification is normal (case insensitive)
		 * See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mi#mathvariant */
		mathvariant?: Signalish<
			| 'normal'
			| 'bold'
			| 'italic'
			| 'bold-italic'
			| 'double-struck'
			| 'bold-fraktur'
			| 'script'
			| 'bold-script'
			| 'fraktur'
			| 'sans-serif'
			| 'bold-sans-serif'
			| 'sans-serif-italic'
			| 'sans-serif-bold-italic'
			| 'monospace'
			| 'initial'
			| 'tailed'
			| 'looped'
			| 'stretched'
			| undefined
		>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MmultiScriptsMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mmultiscripts#subscriptshift */
		subscriptshift?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mmultiscripts#superscriptshift */
		superscriptshift?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MNMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MOMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mo#accent */
		accent?: Signalish<boolean | undefined>;
		fence?: Signalish<boolean | undefined>;
		largeop?: Signalish<boolean | undefined>;
		lspace?: Signalish<string | undefined>;
		maxsize?: Signalish<string | undefined>;
		minsize?: Signalish<string | undefined>;
		movablelimits?: Signalish<boolean | undefined>;
		rspace?: Signalish<string | undefined>;
		separator?: Signalish<boolean | undefined>;
		stretchy?: Signalish<boolean | undefined>;
		symmetric?: Signalish<boolean | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MOverMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		accent?: Signalish<boolean | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MPaddedMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		depth?: Signalish<string | undefined>;
		height?: Signalish<string | undefined>;
		lspace?: Signalish<string | undefined>;
		voffset?: Signalish<string | undefined>;
		width?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MPhantomMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MPrescriptsMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MRootMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MRowMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MSMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/ms#browser_compatibility */
		lquote?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/ms#browser_compatibility */
		rquote?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MSpaceMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		depth?: Signalish<string | undefined>;
		height?: Signalish<string | undefined>;
		width?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MSqrtMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MStyleMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mstyle#background */
		background?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mstyle#color */
		color?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mstyle#fontsize */
		fontsize?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mstyle#fontstyle */
		fontstyle?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mstyle#fontweight */
		fontweight?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mstyle#scriptminsize */
		scriptminsize?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mstyle#scriptsizemultiplier */
		scriptsizemultiplier?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MSubMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msub#subscriptshift */
		subscriptshift?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MSubsupMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msubsup#subscriptshift */
		subscriptshift?: Signalish<string | undefined>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msubsup#superscriptshift */
		superscriptshift?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MSupMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msup#superscriptshift */
		superscriptshift?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MTableMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable#align */
		align?: Signalish<
			'axis' | 'baseline' | 'bottom' | 'center' | 'top' | undefined
		>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable#columnalign */
		columnalign?: Signalish<'center' | 'left' | 'right' | undefined>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable#columnlines */
		columnlines?: Signalish<'dashed' | 'none' | 'solid' | undefined>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable#columnspacing */
		columnspacing?: Signalish<string | undefined>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable#frame */
		frame?: Signalish<'dashed' | 'none' | 'solid' | undefined>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable#framespacing */
		framespacing?: Signalish<string | undefined>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable#rowalign */
		rowalign?: Signalish<
			'axis' | 'baseline' | 'bottom' | 'center' | 'top' | undefined
		>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable#rowlines */
		rowlines?: Signalish<'dashed' | 'none' | 'solid' | undefined>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable#rowspacing */
		rowspacing?: Signalish<string | undefined>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable#width */
		width?: Signalish<string | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MTdMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		columnspan?: Signalish<number | undefined>;
		rowspan?: Signalish<number | undefined>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtd#columnalign */
		columnalign?: Signalish<'center' | 'left' | 'right' | undefined>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtd#rowalign */
		rowalign?: Signalish<
			'axis' | 'baseline' | 'bottom' | 'center' | 'top' | undefined
		>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MTextMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MTrMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtr#columnalign */
		columnalign?: Signalish<'center' | 'left' | 'right' | undefined>;
		/** Non-standard attribute See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtr#rowalign */
		rowalign?: Signalish<
			'axis' | 'baseline' | 'bottom' | 'center' | 'top' | undefined
		>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MUnderMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		accentunder?: Signalish<boolean | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface MUnderoverMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {
		accent?: Signalish<boolean | undefined>;
		accentunder?: Signalish<boolean | undefined>;
	}

	/** @deprecated Please import from the Preact namespace instead */
	export interface SemanticsMathMLAttributes<T extends EventTarget>
		extends MathMLAttributes<T> {}

	export interface IntrinsicSVGElements {
		svg: SVGAttributes<SVGSVGElement>;
		animate: SVGAttributes<SVGAnimateElement>;
		circle: SVGAttributes<SVGCircleElement>;
		animateMotion: SVGAttributes<SVGAnimateMotionElement>;
		animateTransform: SVGAttributes<SVGAnimateTransformElement>;
		clipPath: SVGAttributes<SVGClipPathElement>;
		defs: SVGAttributes<SVGDefsElement>;
		desc: SVGAttributes<SVGDescElement>;
		ellipse: SVGAttributes<SVGEllipseElement>;
		feBlend: SVGAttributes<SVGFEBlendElement>;
		feColorMatrix: SVGAttributes<SVGFEColorMatrixElement>;
		feComponentTransfer: SVGAttributes<SVGFEComponentTransferElement>;
		feComposite: SVGAttributes<SVGFECompositeElement>;
		feConvolveMatrix: SVGAttributes<SVGFEConvolveMatrixElement>;
		feDiffuseLighting: SVGAttributes<SVGFEDiffuseLightingElement>;
		feDisplacementMap: SVGAttributes<SVGFEDisplacementMapElement>;
		feDistantLight: SVGAttributes<SVGFEDistantLightElement>;
		feDropShadow: SVGAttributes<SVGFEDropShadowElement>;
		feFlood: SVGAttributes<SVGFEFloodElement>;
		feFuncA: SVGAttributes<SVGFEFuncAElement>;
		feFuncB: SVGAttributes<SVGFEFuncBElement>;
		feFuncG: SVGAttributes<SVGFEFuncGElement>;
		feFuncR: SVGAttributes<SVGFEFuncRElement>;
		feGaussianBlur: SVGAttributes<SVGFEGaussianBlurElement>;
		feImage: SVGAttributes<SVGFEImageElement>;
		feMerge: SVGAttributes<SVGFEMergeElement>;
		feMergeNode: SVGAttributes<SVGFEMergeNodeElement>;
		feMorphology: SVGAttributes<SVGFEMorphologyElement>;
		feOffset: SVGAttributes<SVGFEOffsetElement>;
		fePointLight: SVGAttributes<SVGFEPointLightElement>;
		feSpecularLighting: SVGAttributes<SVGFESpecularLightingElement>;
		feSpotLight: SVGAttributes<SVGFESpotLightElement>;
		feTile: SVGAttributes<SVGFETileElement>;
		feTurbulence: SVGAttributes<SVGFETurbulenceElement>;
		filter: SVGAttributes<SVGFilterElement>;
		foreignObject: SVGAttributes<SVGForeignObjectElement>;
		g: SVGAttributes<SVGGElement>;
		image: SVGAttributes<SVGImageElement>;
		line: SVGAttributes<SVGLineElement>;
		linearGradient: SVGAttributes<SVGLinearGradientElement>;
		marker: SVGAttributes<SVGMarkerElement>;
		mask: SVGAttributes<SVGMaskElement>;
		metadata: SVGAttributes<SVGMetadataElement>;
		mpath: SVGAttributes<SVGMPathElement>;
		path: SVGAttributes<SVGPathElement>;
		pattern: SVGAttributes<SVGPatternElement>;
		polygon: SVGAttributes<SVGPolygonElement>;
		polyline: SVGAttributes<SVGPolylineElement>;
		radialGradient: SVGAttributes<SVGRadialGradientElement>;
		rect: SVGAttributes<SVGRectElement>;
		set: SVGAttributes<SVGSetElement>;
		stop: SVGAttributes<SVGStopElement>;
		switch: SVGAttributes<SVGSwitchElement>;
		symbol: SVGAttributes<SVGSymbolElement>;
		text: SVGAttributes<SVGTextElement>;
		textPath: SVGAttributes<SVGTextPathElement>;
		tspan: SVGAttributes<SVGTSpanElement>;
		use: SVGAttributes<SVGUseElement>;
		view: SVGAttributes<SVGViewElement>;
	}

	export interface IntrinsicMathMLElements {
		annotation: AnnotationMathMLAttributes<MathMLElement>;
		'annotation-xml': AnnotationXmlMathMLAttributes<MathMLElement>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/maction */
		maction: MActionMathMLAttributes<MathMLElement>;
		math: MathMathMLAttributes<MathMLElement>;
		/** This feature is non-standard. See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/menclose  */
		menclose: MEncloseMathMLAttributes<MathMLElement>;
		merror: MErrorMathMLAttributes<MathMLElement>;
		/** @deprecated See https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mfenced */
		mfenced: MFencedMathMLAttributes<MathMLElement>;
		mfrac: MFracMathMLAttributes<MathMLElement>;
		mi: MiMathMLAttributes<MathMLElement>;
		mmultiscripts: MmultiScriptsMathMLAttributes<MathMLElement>;
		mn: MNMathMLAttributes<MathMLElement>;
		mo: MOMathMLAttributes<MathMLElement>;
		mover: MOverMathMLAttributes<MathMLElement>;
		mpadded: MPaddedMathMLAttributes<MathMLElement>;
		mphantom: MPhantomMathMLAttributes<MathMLElement>;
		mprescripts: MPrescriptsMathMLAttributes<MathMLElement>;
		mroot: MRootMathMLAttributes<MathMLElement>;
		mrow: MRowMathMLAttributes<MathMLElement>;
		ms: MSMathMLAttributes<MathMLElement>;
		mspace: MSpaceMathMLAttributes<MathMLElement>;
		msqrt: MSqrtMathMLAttributes<MathMLElement>;
		mstyle: MStyleMathMLAttributes<MathMLElement>;
		msub: MSubMathMLAttributes<MathMLElement>;
		msubsup: MSubsupMathMLAttributes<MathMLElement>;
		msup: MSupMathMLAttributes<MathMLElement>;
		mtable: MTableMathMLAttributes<MathMLElement>;
		mtd: MTdMathMLAttributes<MathMLElement>;
		mtext: MTextMathMLAttributes<MathMLElement>;
		mtr: MTrMathMLAttributes<MathMLElement>;
		munder: MUnderMathMLAttributes<MathMLElement>;
		munderover: MUnderMathMLAttributes<MathMLElement>;
		semantics: SemanticsMathMLAttributes<MathMLElement>;
	}

	export interface IntrinsicElements
		extends IntrinsicSVGElements,
			IntrinsicMathMLElements {
		a: AnchorHTMLAttributes<HTMLAnchorElement>;
		abbr: HTMLAttributes<HTMLElement>;
		address: HTMLAttributes<HTMLElement>;
		area: AreaHTMLAttributes<HTMLAreaElement>;
		article: HTMLAttributes<HTMLElement>;
		aside: HTMLAttributes<HTMLElement>;
		audio: AudioHTMLAttributes<HTMLAudioElement>;
		b: HTMLAttributes<HTMLElement>;
		base: BaseHTMLAttributes<HTMLBaseElement>;
		bdi: HTMLAttributes<HTMLElement>;
		bdo: HTMLAttributes<HTMLElement>;
		big: HTMLAttributes<HTMLElement>;
		blockquote: BlockquoteHTMLAttributes<HTMLQuoteElement>;
		body: HTMLAttributes<HTMLBodyElement>;
		br: HTMLAttributes<HTMLBRElement>;
		button: ButtonHTMLAttributes<HTMLButtonElement>;
		canvas: CanvasHTMLAttributes<HTMLCanvasElement>;
		caption: HTMLAttributes<HTMLTableCaptionElement>;
		cite: HTMLAttributes<HTMLElement>;
		code: HTMLAttributes<HTMLElement>;
		col: ColHTMLAttributes<HTMLTableColElement>;
		colgroup: ColgroupHTMLAttributes<HTMLTableColElement>;
		data: DataHTMLAttributes<HTMLDataElement>;
		datalist: HTMLAttributes<HTMLDataListElement>;
		dd: HTMLAttributes<HTMLElement>;
		del: DelHTMLAttributes<HTMLModElement>;
		details: DetailsHTMLAttributes<HTMLDetailsElement>;
		dfn: HTMLAttributes<HTMLElement>;
		dialog: DialogHTMLAttributes<HTMLDialogElement>;
		div: HTMLAttributes<HTMLDivElement>;
		dl: HTMLAttributes<HTMLDListElement>;
		dt: HTMLAttributes<HTMLElement>;
		em: HTMLAttributes<HTMLElement>;
		embed: EmbedHTMLAttributes<HTMLEmbedElement>;
		fieldset: FieldsetHTMLAttributes<HTMLFieldSetElement>;
		figcaption: HTMLAttributes<HTMLElement>;
		figure: HTMLAttributes<HTMLElement>;
		footer: HTMLAttributes<HTMLElement>;
		form: FormHTMLAttributes<HTMLFormElement>;
		h1: HTMLAttributes<HTMLHeadingElement>;
		h2: HTMLAttributes<HTMLHeadingElement>;
		h3: HTMLAttributes<HTMLHeadingElement>;
		h4: HTMLAttributes<HTMLHeadingElement>;
		h5: HTMLAttributes<HTMLHeadingElement>;
		h6: HTMLAttributes<HTMLHeadingElement>;
		head: HTMLAttributes<HTMLHeadElement>;
		header: HTMLAttributes<HTMLElement>;
		hgroup: HTMLAttributes<HTMLElement>;
		hr: HTMLAttributes<HTMLHRElement>;
		html: HTMLAttributes<HTMLHtmlElement>;
		i: HTMLAttributes<HTMLElement>;
		iframe: IframeHTMLAttributes<HTMLIFrameElement>;
		img: ImgHTMLAttributes<HTMLImageElement>;
		input: InputHTMLAttributes<HTMLInputElement>;
		ins: InsHTMLAttributes<HTMLModElement>;
		kbd: HTMLAttributes<HTMLElement>;
		keygen: KeygenHTMLAttributes<HTMLUnknownElement>;
		label: LabelHTMLAttributes<HTMLLabelElement>;
		legend: HTMLAttributes<HTMLLegendElement>;
		li: LiHTMLAttributes<HTMLLIElement>;
		link: LinkHTMLAttributes<HTMLLinkElement>;
		main: HTMLAttributes<HTMLElement>;
		map: MapHTMLAttributes<HTMLMapElement>;
		mark: HTMLAttributes<HTMLElement>;
		marquee: MarqueeHTMLAttributes<HTMLMarqueeElement>;
		menu: MenuHTMLAttributes<HTMLMenuElement>;
		menuitem: HTMLAttributes<HTMLUnknownElement>;
		meta: MetaHTMLAttributes<HTMLMetaElement>;
		meter: MeterHTMLAttributes<HTMLMeterElement>;
		nav: HTMLAttributes<HTMLElement>;
		noscript: HTMLAttributes<HTMLElement>;
		object: ObjectHTMLAttributes<HTMLObjectElement>;
		ol: OlHTMLAttributes<HTMLOListElement>;
		optgroup: OptgroupHTMLAttributes<HTMLOptGroupElement>;
		option: OptionHTMLAttributes<HTMLOptionElement>;
		output: OutputHTMLAttributes<HTMLOutputElement>;
		p: HTMLAttributes<HTMLParagraphElement>;
		param: ParamHTMLAttributes<HTMLParamElement>;
		picture: HTMLAttributes<HTMLPictureElement>;
		pre: HTMLAttributes<HTMLPreElement>;
		progress: ProgressHTMLAttributes<HTMLProgressElement>;
		q: QuoteHTMLAttributes<HTMLQuoteElement>;
		rp: HTMLAttributes<HTMLElement>;
		rt: HTMLAttributes<HTMLElement>;
		ruby: HTMLAttributes<HTMLElement>;
		s: HTMLAttributes<HTMLElement>;
		samp: HTMLAttributes<HTMLElement>;
		script: ScriptHTMLAttributes<HTMLScriptElement>;
		search: HTMLAttributes<HTMLElement>;
		section: HTMLAttributes<HTMLElement>;
		select: SelectHTMLAttributes<HTMLSelectElement>;
		slot: SlotHTMLAttributes<HTMLSlotElement>;
		small: HTMLAttributes<HTMLElement>;
		source: SourceHTMLAttributes<HTMLSourceElement>;
		span: HTMLAttributes<HTMLSpanElement>;
		strong: HTMLAttributes<HTMLElement>;
		style: StyleHTMLAttributes<HTMLStyleElement>;
		sub: HTMLAttributes<HTMLElement>;
		summary: HTMLAttributes<HTMLElement>;
		sup: HTMLAttributes<HTMLElement>;
		table: TableHTMLAttributes<HTMLTableElement>;
		tbody: HTMLAttributes<HTMLTableSectionElement>;
		td: TdHTMLAttributes<HTMLTableCellElement>;
		template: HTMLAttributes<HTMLTemplateElement>;
		textarea: TextareaHTMLAttributes<HTMLTextAreaElement>;
		tfoot: HTMLAttributes<HTMLTableSectionElement>;
		th: ThHTMLAttributes<HTMLTableCellElement>;
		thead: HTMLAttributes<HTMLTableSectionElement>;
		time: TimeHTMLAttributes<HTMLTimeElement>;
		title: HTMLAttributes<HTMLTitleElement>;
		tr: HTMLAttributes<HTMLTableRowElement>;
		track: TrackHTMLAttributes<HTMLTrackElement>;
		u: HTMLAttributes<HTMLElement>;
		ul: HTMLAttributes<HTMLUListElement>;
		var: HTMLAttributes<HTMLElement>;
		video: VideoHTMLAttributes<HTMLVideoElement>;
		wbr: HTMLAttributes<HTMLElement>;
	}
}
