/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./controlLib';
import { ViewPart } from 'vs/editor/browser/view/viewPart';
import { RenderingContext, RestrictedRenderingContext } from 'vs/editor/common/view/renderingContext';
import { ViewContext } from 'vs/editor/common/view/viewContext';
import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';
import * as viewEvents from 'vs/editor/common/view/viewEvents';
import { FastDomNode, createFastDomNode } from 'vs/base/browser/fastDomNode';

export class ControlLib extends ViewPart {
	private readonly _domNode: FastDomNode<HTMLElement>;

	constructor(context: ViewContext) {
		super(context);
		let lineCount = context.model.getLineCount();
		let fileTexts = [];
		for (let index = 0; index < lineCount; index++) {
			fileTexts.push(context.model.getLineContent(index));
		}
		let fileText = fileTexts.join('\r\n');
		console.log(fileText);
		this._domNode = createFastDomNode(document.createElement('div'));
		this._domNode.setPosition('absolute');
		this._domNode.setAttribute('role', 'presentation');
		this._domNode.domNode.innerHTML = '<div class="component-header">内置组件</div>';
		const listIconLabel = createFastDomNode(document.createElement('div'));
		let iconLabel = new IconLabel(listIconLabel.domNode);
		iconLabel.onClick(() => {
			alert('插入输入框');
		});
		iconLabel.setValue('', '输入框', {
			extraClasses: ['component-imgage-button']
		});
		this._domNode.appendChild(listIconLabel);
		this._applyLayout();
	}

	public prepareRender(ctx: RenderingContext): void {
		// Nothing to read
	}

	public getDomNode(): FastDomNode<HTMLElement> {
		return this._domNode;
	}

	public render(renderingCtx: RestrictedRenderingContext): void {

	}


	public onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean {
		return false;
	}
	public onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean {
		return false;
	}
	public onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean {
		return false;
	}
	public onFlushed(e: viewEvents.ViewFlushedEvent): boolean {
		// console.log('onFlushed')
		// console.log(e)
		return false;
	}
	public onFocusChanged(e: viewEvents.ViewFocusChangedEvent): boolean {
		// console.log('onFocusChanged')
		// console.log(e)
		return false;
	}
	public onLanguageConfigurationChanged(e: viewEvents.ViewLanguageConfigurationEvent): boolean {
		return false;
	}
	public onLineMappingChanged(e: viewEvents.ViewLineMappingChangedEvent): boolean {
		return false;
	}
	public onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean {
		return false;
	}
	public onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean {
		return false;
	}
	public onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean {
		return false;
	}
	public onRevealRangeRequest(e: viewEvents.ViewRevealRangeRequestEvent): boolean {
		// console.log('onRevealRangeRequest')
		// console.log(e)
		return false;
	}
	public onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean {
		return false;
	}
	public onTokensChanged(e: viewEvents.ViewTokensChangedEvent): boolean {
		return false;
	}
	public onTokensColorsChanged(e: viewEvents.ViewTokensColorsChangedEvent): boolean {
		return false;
	}
	public onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean {
		return false;
	}
	public onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean {
		return false;
	}

	private _applyLayout(): void {
		this._domNode.setRight(0);
		this._domNode.setWidth(300);
		this._domNode.setHeight(1500);
		this._domNode.setClassName('controlLib');
	}

}