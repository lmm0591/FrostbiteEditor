/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./infoPlaneWidget';
import { IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { FindInput } from 'vs/base/browser/ui/findinput/findInput';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { Widget } from 'vs/base/browser/ui/widget';
import { Sash, IHorizontalSashLayoutProvider } from 'vs/base/browser/ui/sash/sash';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, OverlayWidgetPositionPreference } from 'vs/editor/browser/editorBrowser';
import { FindReplaceState } from 'vs/editor/contrib/find/findState';
import { InfoSection } from 'vs/extra/contrib/infoPlane/infoSection';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IIdentifiedSingleEditOperation } from 'vs/editor/common/model';
import { ValueEditOperation } from 'vs/extra/common/core/valueEditOperation';
import { parse } from 'react-docgen';

const FIND_WIDGET_INITIAL_WIDTH = 300;

export interface ValueChangeEvent {
	value: string;
	valueRange: IReactDocgenRange;
}

export class InfoPlaneWidget extends Widget implements IOverlayWidget, IHorizontalSashLayoutProvider {
	private static readonly ID = 'editor.contrib.infoPlaneWidget';
	private _codeEditor: ICodeEditor;

	private _domNode: HTMLElement;
	private _findInput: FindInput;
	private _replaceInputBox: InputBox;
	private _infoSection: InfoSection;
	private _isVisible: boolean;

	constructor(
		codeEditor: ICodeEditor,
		state: FindReplaceState,
		contextViewProvider: IContextViewProvider,
		keybindingService: IKeybindingService,
		contextKeyService: IContextKeyService,
		themeService: IThemeService
	) {
		super();
		this._codeEditor = codeEditor;
		this._isVisible = false;
		this._buildDomNode();
		this._codeEditor.addOverlayWidget(this);

		this._codeEditor.onDidDispose(() => {

		});

		this._codeEditor.onDidChangeModelContent(e => {
			console.log('onDidChangeModelContent');
			// console.log(this._codeEditor.getValue());
			var componentInfo = parse(this._codeEditor.getValue());
			console.log(componentInfo);
			this._infoSection.updateProps(componentInfo.props);
		});
		this._codeEditor.onDidFocusEditor(() => {
			// console.log(this._codeEditor.getValue());
			if (this._isVisible === false) {
				var componentInfo = parse(this._codeEditor.getValue());
				console.log(componentInfo);

				this._domNode.style.right = `0px`;
				this._domNode.style.height = `${codeEditor.getLayoutInfo().contentHeight}px`;
				this._infoSection = new InfoSection({
					props: componentInfo.props,
					title: '属性',
					onChangeValue: (event: ValueChangeEvent) => {
						let identifiedSingleEditOperationList: Array<IIdentifiedSingleEditOperation> = ValueEditOperation.textReplace(event);
						this._codeEditor.executeEdits('react-props', identifiedSingleEditOperationList);
					}
				});
				this._domNode.appendChild(this._infoSection.domNode);
				this._isVisible = true;
			}
		});
	}

	// ----- IOverlayWidget API

	public getId(): string {
		return InfoPlaneWidget.ID;
	}

	public getDomNode(): HTMLElement {
		return this._domNode;
	}

	public getPosition(): IOverlayWidgetPosition {
		if (this._isVisible) {
			return {
				preference: OverlayWidgetPositionPreference.TOP_RIGHT_CORNER
			};
		}
		return null;
	}

	// ----- React to state changes

	// ----- actions

	// ----- Public

	public focusFindInput(): void {
		this._findInput.select();
		// Edge browser requires focus() in addition to select()
		this._findInput.focus();
	}

	public focusReplaceInput(): void {
		this._replaceInputBox.select();
		// Edge browser requires focus() in addition to select()
		this._replaceInputBox.focus();
	}

	public highlightFindOptions(): void {
		this._findInput.highlightFindOptions();
	}

	// ----- sash
	public getHorizontalSashTop(sash: Sash): number {
		return 0;
	}
	public getHorizontalSashLeft?(sash: Sash): number {
		return 0;
	}
	public getHorizontalSashWidth?(sash: Sash): number {
		return 500;
	}

	// ----- initialization

	private _buildDomNode(): void {
		// Widget
		this._domNode = document.createElement('div');
		this._domNode.className = 'editor-widget info-plane-widget';
		this._domNode.setAttribute('aria-hidden', 'true');
		// We need to set this explicitly, otherwise on IE11, the width inheritence of flex doesn't work.
		this._domNode.style.width = `${FIND_WIDGET_INITIAL_WIDTH}px`;
		this._domNode.style.right = '0px';
		this._domNode.innerHTML = '<h2>属性库</h2>';
	}

}