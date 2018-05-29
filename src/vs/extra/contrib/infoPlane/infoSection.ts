/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./infoSection';
import { Widget } from 'vs/base/browser/ui/widget';
import * as dom from 'vs/base/browser/dom';
import { SimpleInput } from 'vs/extra/contrib/infoPlane/simpleInput';
import { ValueChangeEvent } from 'vs/extra/contrib/infoPlane/infoPlaneWidget';

export interface IInfoSectionOpts {
	label: string;
	className?: string;
	value?: string;
	onTrigger?: (value: string) => void;
}


export interface InfoSectionOpts {
	title: string;
	props: Map<string, IReactDocgenProps>;
}

export class InfoSection extends Widget {
	// private _props: Map<string, IReactDocgenProps> = new Map();
	private _domNode: HTMLElement = null;
	private _domTitleNode: HTMLElement = null;
	private _propList: Array<SimpleInput> = [];
	private _simpleInputMap: Map<string, SimpleInput> = new Map();
	private _jsxElement: JSXElement;
	public onChangeValue: (event: ValueChangeEvent) => void = () => { };


	constructor() {
		super();
		this._domNode = document.createElement('div');
		this._domNode.className = 'extra-info-section';

		this._domTitleNode = document.createElement('div');
		this._domTitleNode.className = 'extra-info-section-title';
		this._domNode.appendChild(this._domTitleNode);
	}

	public setJSXElement(jsxElement: JSXElement) {
		this._jsxElement = jsxElement;
	}

	public getJSXElement(): JSXElement {
		return this._jsxElement;
	}

	public get domNode(): HTMLElement {
		return this._domNode;
	}

	public setVisble(isVisble: boolean) {
		dom.toggleClass(this._domNode, 'none', !isVisble);
	}

	public isEnabled(): boolean {
		return (this._domNode.tabIndex >= 0);
	}

	public setEnabled(enabled: boolean): void {
		dom.toggleClass(this._domNode, 'disabled', !enabled);
		this._domNode.setAttribute('aria-disabled', String(!enabled));
		this._domNode.tabIndex = enabled ? 0 : -1;
	}

	public updateProps(props: Map<string, IReactDocgenProps>) {
		this.clearPropAll();
		for (let key in props) {
			let prop = props[key] as IReactDocgenProps;
			this.addProp(key, prop);
		}
	}

	public setProp(key: string, value: string) {
		return this._simpleInputMap.get(key).setValue(value);
	}

	public clearPropAll() {
		this._simpleInputMap.clear();
		while (this._propList.length) {
			let prop = this._propList.pop();
			prop.domNode.remove();
		}
	}

	public addProp(key: string, prop: IReactDocgenProps) {
		let simpleInput = new SimpleInput({
			id: key,
			label: key,
			descript: prop.description,
			value: prop.defaultValue ? prop.defaultValue.value : '',
			onTrigger: e => {
				console.log('infoSection-ontrigger');
				console.log(e);
				console.log(prop);
				console.log(key);
				this.onChangeValue({
					key,
					value: e,
					valueRange: prop.valueRange
				});
			}
		});

		this._propList.push(simpleInput);
		this._simpleInputMap.set(key, simpleInput);
		this._domNode.appendChild(simpleInput.domNode);
	}

	setTitle(title: string) {
		this._domTitleNode.innerText = title;
	}

}