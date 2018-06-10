/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./styles/componentSection';
import { Widget } from 'vs/base/browser/ui/widget';
import * as dom from 'vs/base/browser/dom';
import { ComponentProp } from 'vs/extra/contrib/infoPlane/componentProp';
import { ValueChangeEvent } from 'vs/extra/contrib/infoPlane/infoPlaneWidget';

export class ComponentSection extends Widget {
	// private _props: Map<string, IReactDocgenProps> = new Map();
	private _element: HTMLElement = null;
	private _domTitleNode: HTMLElement = null;
	private _componentProps: Array<ComponentProp> = [];
	private _componentPropMap: Map<string, ComponentProp> = new Map();

	public onChangeValue: (event: ValueChangeEvent) => void = () => { };

	constructor() {
		super();
		this._element = document.createElement('div');
		this._element.className = 'FE-component-section';

		this._domTitleNode = document.createElement('div');
		this._domTitleNode.className = 'FE-component-section-title';
		this._element.appendChild(this._domTitleNode);
	}

	public get domNode(): HTMLElement {
		return this._element;
	}

	public setVisble(isVisble: boolean) {
		dom.toggleClass(this._element, 'none', !isVisble);
	}

	public isEnabled(): boolean {
		return (this._element.tabIndex >= 0);
	}

	public setEnabled(enabled: boolean): void {
		dom.toggleClass(this._element, 'disabled', !enabled);
		this._element.setAttribute('aria-disabled', String(!enabled));
		this._element.tabIndex = enabled ? 0 : -1;
	}

	public setProp(key: string, value: string) {
		if (this._componentPropMap.get(key)) {
			this._componentPropMap.get(key).setValue(value);
		} else {
			this.addProp(key, new ComponentProp({ label: key, value }));
		}
	}

	public clearPropAll() {
		this._componentPropMap.clear();
		while (this._componentProps.length) {
			this._componentProps.pop().remove();
		}
	}

	public delProp(key: string) {
		this._componentPropMap.get(key).remove();
	}

	public addProp(key: string, componentProp: ComponentProp) {
		componentProp.onChange = (e: ComponentPropValueEvent) => {
			this.onChangeValue({
				key,
				value: e.value
			});
		};
		this._componentProps.push(componentProp);
		this._componentPropMap.set(key, componentProp);
		this._element.appendChild(componentProp.element);
	}

	public setTitle(title: string) {
		this._domTitleNode.innerText = title;
	}

}