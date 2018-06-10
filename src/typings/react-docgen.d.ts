interface IReactDocgenParse {
	ast: any;
	description: string;
	displayName: string;
	methods: Array<Object>;
	props: Map<string, IReactDocgenProps>;
	jsxElements: Array<JSXElement>;
}

declare interface JSXElementAttribute {
	end: number;
	loc: any;
	name: any;
	start: number;
	type: string;
	value: any;
}

declare interface JSXElement {
	elementName: string;
	isStaticElement: boolean;
	importPath: string;
	type: string;
	children: Array<JSXElement>;
	loc: {
		start: { column: number, line: number },
		end: { column: number, line: number },
	};
	openingElement: {
	  attributes: Array<JSXElementAttribute>;
	  name: Object;
	};
	original: JSXElement;
}

type IReactDocgenLoc = {
	column: number,
	line: number
}

type IReactDocgenRange = {
	start: IReactDocgenLoc,
	end: IReactDocgenLoc
}

interface IReactDocgenProps {
	defaultValue: IReactDocgenPropsDefaultValue;
	description: string;
	required: boolean;
	type: IReactDocgenPropsType,
	valueRange: IReactDocgenRange,
}

interface IReactDocgenPropsDefaultValue {
	computed: boolean;
	value: string;
}

interface IReactDocgenPropsType {
	name: string;
}

declare module "react-analysis" {
	export function parse(source: string): IReactDocgenParse;
	export let operation: {
		defaultProps: {
			setDefaultProps (code: IReactDocgenParse, propKey: string, propValue: string) : void;
		}
	};
}

declare module "fs-extra" {
	export function copy (any: any, any1: any)
}

declare module "recast" {
	export function parse(source: string): any;
	export function print(ast: any, option?: any ): any;
	export class types {
		static builders: any;
		static NodePath: any;
	}
}
