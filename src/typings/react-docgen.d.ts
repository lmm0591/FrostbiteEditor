interface IReactDocgenParse {
	description: string;
	displayName: string;
	methods: Array<Object>;
	props: Map<string, IReactDocgenProps>;
	jsxElements: Array<JSXElement>;
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
	  attributes: Array<Object>;
	  name: Object;
	};
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
}

declare module "fs-extra" {
	export function copy (any: any, any1: any)
}
