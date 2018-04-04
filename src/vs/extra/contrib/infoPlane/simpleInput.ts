/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./simpleInput';
import { Widget } from 'vs/base/browser/ui/widget';
import * as dom from 'vs/base/browser/dom';

export interface ISimpleInputOpts {
	id: string;
	label: string;
	descript?: string;
	className?: string;
	value?: string;
	onTrigger?: () => void;
}

export class SimpleInput extends Widget {

	private _opts: ISimpleInputOpts;
	private _domNode: HTMLElement;
	private _labelSpanNode: HTMLElement;
	private _input: HTMLInputElement;

	constructor(opts: ISimpleInputOpts) {
		super();
		this._opts = opts;

		this._domNode = document.createElement('div');

		this._labelSpanNode = document.createElement('span');
		this._labelSpanNode.className = 'label';
		this._labelSpanNode.innerText = opts.label;
		this._labelSpanNode.title = opts.descript;

		this._input = document.createElement('input');
		this._input.className = 'input';
		this._input.value = opts.value;

		this._domNode.tabIndex = 0;

		this._domNode.appendChild(this._labelSpanNode);
		this._domNode.appendChild(this._input);

		this._domNode.className = 'extra-simple-input ' + this._opts.className;
		/*
		this.onclick(this._domNode, (e) => {
			this._opts.onTrigger();
			e.preventDefault();
		});
		*/

		this.onkeydown(this._input, e => {
			console.log(e);
			e.preventDefault();
		});

	}

	public setValue(value: string) {
		this._input.value = value;
	}

	public get domNode(): HTMLElement {
		return this._domNode;
	}

	public isEnabled(): boolean {
		return (this._domNode.tabIndex >= 0);
	}

	public focus(): void {
		this._domNode.focus();
	}

	public setEnabled(enabled: boolean): void {
		dom.toggleClass(this._domNode, 'disabled', !enabled);
		this._domNode.setAttribute('aria-disabled', String(!enabled));
		this._domNode.tabIndex = enabled ? 0 : -1;
	}

	public setExpanded(expanded: boolean): void {
		this._domNode.setAttribute('aria-expanded', String(!!expanded));
	}

	public toggleClass(className: string, shouldHaveIt: boolean): void {
		dom.toggleClass(this._domNode, className, shouldHaveIt);
	}
}