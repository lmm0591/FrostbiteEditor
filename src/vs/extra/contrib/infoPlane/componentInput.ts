/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./styles/componentInput';
import { Widget } from 'vs/base/browser/ui/widget';
import * as dom from 'vs/base/browser/dom';

export interface IComponentInputOpts {
	className?: string;
	value?: string;
}

export class ComponentInput extends Widget implements IComponentPropValue {

	private _opts: IComponentInputOpts;
	private _element: HTMLElement;
	private _input: HTMLInputElement;

	public onChange = (e: ComponentPropValueEvent) => {};

	constructor(opts: IComponentInputOpts = { value: '', className: '' }) {
		super();
		this._opts = opts;

		this._element = document.createElement('div');
		this._element.className = 'FE-component-input ' + this._opts.className;

		this._input = document.createElement('input');
		// this._input.className = '';
		this._input.value = opts.value;

		this._element.appendChild(this._input);

		this._input.addEventListener('change', (e: Event) => {
			this.onChange({ value: this._input.value});
			e.preventDefault();
		});
	}

	public setValue(value: string) {
		this._input.value = value;
	}

	public getValue() {
		return this._input.value;
	}

	setData() {
		// input 不用设置 data
	}

	public get element(): HTMLElement {
		return this._element;
	}

	public isEnabled(): boolean {
		return (this._element.tabIndex >= 0);
	}

	public focus(): void {
		this._element.focus();
	}

	public setEnabled(enabled: boolean): void {
		dom.toggleClass(this._element, 'disabled', !enabled);
		this._element.setAttribute('aria-disabled', String(!enabled));
		this._element.tabIndex = enabled ? 0 : -1;
	}

	public setExpanded(expanded: boolean): void {
		this._element.setAttribute('aria-expanded', String(!!expanded));
	}

	public toggleClass(className: string, shouldHaveIt: boolean): void {
		dom.toggleClass(this._element, className, shouldHaveIt);
	}
}