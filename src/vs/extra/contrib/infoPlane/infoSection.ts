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
	onChangeValue: (event: ValueChangeEvent) => void;
}

export class InfoSection extends Widget {
	private _props: Map<string, IReactDocgenProps>;
	private _domNode: HTMLElement = null;
	private _domTitleNode: HTMLElement = null;
	private _propList: Array<SimpleInput> = [];
	private _simpleInputMap: Map<string, SimpleInput> = new Map();
	private _onChangeValue: (event: ValueChangeEvent) => void;


	constructor(opts: InfoSectionOpts) {
		super();
		this._props = opts.props;
		this._onChangeValue = opts.onChangeValue;
		this._domNode = document.createElement('div');
		this._domNode.className = 'extra-info-section';
		this.setTitle(opts.title);
		for (let key in this._props) {
			let prop = this._props[key] as IReactDocgenProps;
			this.addProp(key, prop);
		}
	}

	public get domNode(): HTMLElement {
		return this._domNode;
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
		this._propList = [];
		while (this._domNode.childElementCount) {
			this._domNode.children[0].remove();
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
				this._onChangeValue({
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
		if (this._domTitleNode === null) {
			this._domTitleNode = document.createElement('div');
			this._domTitleNode.className = 'extra-info-section-title';
			this._domNode.appendChild(this._domTitleNode);
		}
		this._domTitleNode.innerText = title;
	}
}