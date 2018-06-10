interface ComponentPropValueEvent {
	value: string
}

interface IComponentPropValue {
	setValue (value: string): void
	getValue(): string
	setData(data: any): void
	element: HTMLElement
	onChange (event: ComponentPropValueEvent): void
}

interface IComponentPropOpts {
	label: string;
	value?: string;
	description?: string;
	type?: string;
	data?: any;
	className?: string;
	// valueRange: any;
}