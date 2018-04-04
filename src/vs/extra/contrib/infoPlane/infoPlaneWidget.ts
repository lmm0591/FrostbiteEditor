/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./infoPlaneWidget';
import { KeyCode } from 'vs/base/common/keyCodes';
import * as dom from 'vs/base/browser/dom';
import { IKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { FindInput } from 'vs/base/browser/ui/findinput/findInput';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { Widget } from 'vs/base/browser/ui/widget';
import { Sash, IHorizontalSashLayoutProvider } from 'vs/base/browser/ui/sash/sash';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, IViewZone, OverlayWidgetPositionPreference } from 'vs/editor/browser/editorBrowser';
import { FindReplaceState } from 'vs/editor/contrib/find/findState';
import { InfoSection } from 'vs/extra/contrib/infoPlane/infoSection';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { parse } from 'react-docgen';


const FIND_WIDGET_INITIAL_WIDTH = 300;

const FIND_INPUT_AREA_HEIGHT = 34; // The height of Find Widget when Replace Input is not visible.


export class FindWidgetViewZone implements IViewZone {
	public afterLineNumber: number;
	public heightInPx: number;
	public suppressMouseDown: boolean;
	public domNode: HTMLElement;

	constructor(afterLineNumber: number) {
		this.afterLineNumber = afterLineNumber;

		this.heightInPx = FIND_INPUT_AREA_HEIGHT;
		this.suppressMouseDown = false;
		this.domNode = document.createElement('div');
		this.domNode.className = 'dock-find-viewzone';
	}
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

			var componentInfo = parse(this._codeEditor.getValue());
			console.log(componentInfo);
			this._infoSection.updateProps(componentInfo.props);
		});
		this._codeEditor.onDidFocusEditor(() => {
			if (this._isVisible === false) {
				var componentInfo = parse(this._codeEditor.getValue());
				console.log(componentInfo);

				this._domNode.style.right = `0px`;
				this._domNode.style.height = `${codeEditor.getLayoutInfo().contentHeight}px`;
				this._infoSection = new InfoSection(componentInfo.props);
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

export interface ISimpleButtonOpts {
	label: string;
	className: string;
	onTrigger: () => void;
	onKeyDown: (e: IKeyboardEvent) => void;
}

export class SimpleButton extends Widget {

	private _opts: ISimpleButtonOpts;
	private _domNode: HTMLElement;

	constructor(opts: ISimpleButtonOpts) {
		super();
		this._opts = opts;

		this._domNode = document.createElement('div');
		this._domNode.title = this._opts.label;
		this._domNode.tabIndex = 0;
		this._domNode.className = 'button ' + this._opts.className;
		this._domNode.setAttribute('role', 'button');
		this._domNode.setAttribute('aria-label', this._opts.label);

		this.onclick(this._domNode, (e) => {
			this._opts.onTrigger();
			e.preventDefault();
		});
		this.onkeydown(this._domNode, (e) => {
			if (e.equals(KeyCode.Space) || e.equals(KeyCode.Enter)) {
				this._opts.onTrigger();
				e.preventDefault();
				return;
			}
			this._opts.onKeyDown(e);
		});
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