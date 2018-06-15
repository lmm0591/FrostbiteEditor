/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/index';
import { Widget } from 'vs/base/browser/ui/widget';
import * as dom from 'vs/base/browser/dom';
import { PropRow } from 'vs/extra/component/propSection/propRow';
import { ValueChangeEvent } from 'vs/extra/contrib/infoPlane/infoPlaneWidget';

export class PropSection extends Widget {
	// private _props: Map<string, IReactDocgenProps> = new Map();
	private domTitleNode: HTMLElement = null;
	private propRows: Array<PropRow> = [];
	private propRowMap: Map<string, PropRow> = new Map();

	public element: HTMLElement = null;
	public onChangeValue: (event: ValueChangeEvent) => void = () => { };

	constructor() {
		super();
		this.element = document.createElement('div');
		this.element.className = 'FE-prop-section';

		this.domTitleNode = document.createElement('div');
		this.domTitleNode.className = 'FE-prop-section-title';
		this.element.appendChild(this.domTitleNode);
	}

	public setVisble(isVisble: boolean) {
		dom.toggleClass(this.element, 'none', !isVisble);
	}

	public isEnabled(): boolean {
		return (this.element.tabIndex >= 0);
	}

	public setEnabled(enabled: boolean): void {
		dom.toggleClass(this.element, 'disabled', !enabled);
		this.element.setAttribute('aria-disabled', String(!enabled));
		this.element.tabIndex = enabled ? 0 : -1;
	}

	public setProp(key: string, value: string) {
		if (this.propRowMap.get(key)) {
			this.propRowMap.get(key).setValue(value);
		} else {
			this.addProp(key, new PropRow({ label: key, value }));
		}
	}

	public clearPropAll() {
		this.propRowMap.clear();
		while (this.propRows.length) {
			this.propRows.pop().remove();
		}
	}

	public delProp(key: string) {
		this.propRowMap.get(key).remove();
	}

	public addProp(key: string, componentProp: PropRow) {
		componentProp.onChange = (e: ComponentPropValueEvent) => {
			this.onChangeValue({
				key,
				value: e.value
			});
		};
		this.propRows.push(componentProp);
		this.propRowMap.set(key, componentProp);
		this.element.appendChild(componentProp.element);
	}

	public setTitle(title: string) {
		this.domTitleNode.innerText = title;
	}

}