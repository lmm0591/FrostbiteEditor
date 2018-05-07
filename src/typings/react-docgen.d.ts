interface IReactDocgenParse {
	description: string;
	displayName: string;
	methods: Array<Object>;
	props: Map<string, IReactDocgenProps>;
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

declare module "react-docgen" {
	export function parse(source: string): IReactDocgenParse;
}

declare module "fs-extra" {
	export function copy (any: any, any1: any)
}
