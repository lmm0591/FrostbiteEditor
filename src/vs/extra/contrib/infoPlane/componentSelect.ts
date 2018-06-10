/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./styles/componentSelect';
import { Widget } from 'vs/base/browser/ui/widget';
import * as dom from 'vs/base/browser/dom';

export interface IComponentInputOpts {
	className?: string;
	value?: string;
}

export class ComponentSelect extends Widget implements IComponentPropValue {

	private _opts: IComponentInputOpts;
	private _element: HTMLElement;
	private _select: HTMLSelectElement;

	public onChange = (e: ComponentPropValueEvent) => {};

	constructor(opts: IComponentInputOpts = { value: '', className: '' }) {
		super();
		this._opts = opts;

		this._element = document.createElement('div');
		this._element.className = 'FE-component-select ' + this._opts.className;

		this._select = document.createElement('select');
		this._select.value = opts.value;

		this._element.appendChild(this._select);

		this._select.addEventListener('change', (e: Event) => {
			let select = e.srcElement as HTMLSelectElement;
			this.onChange({ value: select.value });
			e.preventDefault();
		});
	}

	public setValue(value: string) {
		this._select.value = value;
	}

	public getValue() {
		return this._select.value;
	}

	public setData(datas: Array<any>) {
		datas.forEach(({ label, value }) => {
			let option = document.createElement('option');
			option.label = label;
			option.value = value;
			this._select.add(option);
		});
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

	/*
	public setExpanded(expanded: boolean): void {
		this._element.setAttribute('aria-expanded', String(!!expanded));
	}
	*/

	public toggleClass(className: string, shouldHaveIt: boolean): void {
		dom.toggleClass(this._element, className, shouldHaveIt);
	}
}