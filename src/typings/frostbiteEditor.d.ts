interface ComponentPropValueEvent {
	value: string
}

interface IComponentPropValue {
	setValue (value: string): void
	getValue(): string
	element: HTMLElement
	onChange (event: ComponentPropValueEvent): void
}

interface IComponentPropOpts {
	label: string;
	value?: string;
	description?: string;
	type?: string;
	className?: string;
	// valueRange: any;
}