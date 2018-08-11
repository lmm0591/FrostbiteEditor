/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/index';
import { Widget } from 'vs/base/browser/ui/widget';
import * as dom from 'vs/base/browser/dom';

export interface IComponentInputOpts {
	className?: string;
	value?: string;
	type?: string;
}

export class ComponentInput extends Widget implements IComponentPropValue {

	private _opts: IComponentInputOpts;
	private _input: HTMLInputElement;

	public element: HTMLElement;
	public onChange = (e: ComponentPropValueEvent) => {};

	constructor(opts: IComponentInputOpts = { value: '', className: '', type: 'text' }) {
		super();
		this._opts = opts;

		this.element = document.createElement('div');
		this.element.className = 'FE-component-input ' + this._opts.className;

		this._input = document.createElement('input');
		this._input.setAttribute('type', this._opts.type);
		this._input.value = opts.value;

		this.element.appendChild(this._input);

		this._input.addEventListener('change', (e: Event) => {
			console.log('input_change');
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


	public isEnabled(): boolean {
		return (this.element.tabIndex >= 0);
	}

	public focus(): void {
		this._input.focus();
	}

	public setEnabled(enabled: boolean): void {
		dom.toggleClass(this.element, 'disabled', !enabled);
		this.element.setAttribute('aria-disabled', String(!enabled));
		this.element.tabIndex = enabled ? 0 : -1;
	}

	public setExpanded(expanded: boolean): void {
		this.element.setAttribute('aria-expanded', String(!!expanded));
	}

	public toggleClass(className: string, shouldHaveIt: boolean): void {
		dom.toggleClass(this.element, className, shouldHaveIt);
	}
}