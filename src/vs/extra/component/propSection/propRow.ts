/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { Widget } from 'vs/base/browser/ui/widget';
import { ComponentInput } from 'vs/extra/component/input/input';
import { ComponentSelect } from 'vs/extra/contrib/infoPlane/componentSelect';
// import * as dom from 'vs/base/browser/dom';


export class PropRow extends Widget {

	private _element: HTMLElement;
	private _spanElment: HTMLElement;
	private _valueComponent: IComponentPropValue;
	// public valueType: string;

	constructor(opts: IComponentPropOpts) {
		super();
		this._element = document.createElement('div');
		this._element.tabIndex = 0;
		this._element.className = 'FE-prop-row';

		this._spanElment = document.createElement('span');
		this._spanElment.className = 'FE-prop-row-label';
		this._spanElment.innerText = opts.label;
		this._spanElment.title = opts.description;

		this._valueComponent = this.createValueElement(opts.type, opts.data);
		this._valueComponent.setValue(opts.value);


		this._element.appendChild(this._spanElment);
		this._element.appendChild(this._valueComponent.element);
	}

	public get element() {
		return this._element;
	}

	public setValue(value: string) {
		this._valueComponent.setValue(value);
	}

	public remove() {
		this._element.remove();
	}

	public set onChange (_onChange) {
		this._valueComponent.onChange = _onChange;
	}

	private createValueElement(valueType: string, data: any): IComponentPropValue {
		switch (valueType) {
			case 'string':
				return new ComponentInput();
			case 'enum':
			case 'bool':
				let componentSelect = new ComponentSelect();
				componentSelect.setData(data);
				return componentSelect;
			case 'number':
				return new ComponentInput({type: 'number'});
			default:
				return new ComponentInput();
		}
	}
}