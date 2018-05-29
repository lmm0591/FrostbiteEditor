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
import URI from 'vs/base/common/uri';
import { Sash, IHorizontalSashLayoutProvider } from 'vs/base/browser/ui/sash/sash';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, OverlayWidgetPositionPreference } from 'vs/editor/browser/editorBrowser';
import { FindReplaceState } from 'vs/editor/contrib/find/findState';
import { InfoSection } from 'vs/extra/contrib/infoPlane/infoSection';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IIdentifiedSingleEditOperation } from 'vs/editor/common/model';
import { ValueEditOperation } from 'vs/extra/common/core/valueEditOperation';
import * as path from 'path';
// TODO: 最好要暴露 AST 方便重构代码
import { parse } from 'react-analysis';
import * as recast from 'recast';

const FIND_WIDGET_INITIAL_WIDTH = 300;
const LINE_POS_MAX = 1000000; // 计算位置坐标，先把行乘以足够大的数，这样好计算

export interface ValueChangeEvent {
	key: string;
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
	private _referComponentInfoSection: InfoSection;
	private _isVisible: boolean;

	constructor(
		codeEditor: ICodeEditor,
		state: FindReplaceState,
		contextViewProvider: IContextViewProvider,
		keybindingService: IKeybindingService,
		contextKeyService: IContextKeyService,
		themeService: IThemeService,
		private fileService: IFileService,
		private workbenchEditorService: IWorkbenchEditorService
	) {
		super();
		this._codeEditor = codeEditor;
		this._isVisible = false;
		this._buildDomNode();
		// 初始当前组件信息
		this._infoSection = new InfoSection();
		this._domNode.appendChild(this._infoSection.domNode);

		// 初始引用组件信息
		this._referComponentInfoSection = new InfoSection();
		this._domNode.appendChild(this._referComponentInfoSection.domNode);

		this._referComponentInfoSection.onChangeValue = (event: ValueChangeEvent) => {
			console.log('event');
			console.log(event);
			console.log(event.value);
			let jsxElement = this._referComponentInfoSection.getJSXElement();
			let keyIdentifier = recast.types.builders.jsxIdentifier(event.key);
			let valueLiteral = recast.types.builders.literal(event.value);

			let attributes: Array<JSXElementAttribute> = jsxElement.openingElement.attributes.filter(attribute => attribute.name.name === event.key);
			console.log(attributes);

			if (attributes.length) {
				attributes[0] = recast.types.builders.jsxAttribute(attributes[0].name, valueLiteral);
			} else {
				let newJSXElementArrt = recast.types.builders.jsxAttribute(keyIdentifier, valueLiteral);
				jsxElement.openingElement.attributes.push(newJSXElementArrt);
			}
			var code = recast.print(jsxElement).code;
			// let astReferComponent = recast.parse(code);
			// console.log(astReferComponent);

			let identifiedSingleEditOperationList: Array<IIdentifiedSingleEditOperation> = ValueEditOperation.textReplace({
				key: event.key,
				value: code,
				valueRange: {
					start: jsxElement.loc.start,
					end: {
						line: jsxElement.loc.end.line,
						column: jsxElement.loc.end.column + event.value.length
					}
				}
			});
			this._codeEditor.executeEdits('react-props', identifiedSingleEditOperationList);
		};

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

		this._codeEditor.onDidChangeCursorPosition(e => {
			var componentInfo = parse(this._codeEditor.getValue());
			componentInfo.jsxElements.forEach(jsxElement => {
				let start = jsxElement.loc.start.line * LINE_POS_MAX + jsxElement.loc.start.column;
				let end = jsxElement.loc.end.line * LINE_POS_MAX + jsxElement.loc.end.column;
				let cursorPos = e.position.lineNumber * LINE_POS_MAX + e.position.column;
				this._referComponentInfoSection.setVisble(false);
				this._referComponentInfoSection.clearPropAll();
				// 当前光标在组件范围内
				if (jsxElement.importPath && start <= cursorPos && end >= cursorPos) {
					this.buildReferInfoSection(jsxElement);
					this._referComponentInfoSection.setVisble(true);
				}
			});
		});

		this._codeEditor.onDidFocusEditor(() => {
			// console.log(this._codeEditor.getValue());
			if (this._isVisible === false) {
				var componentInfo = parse(this._codeEditor.getValue());
				console.log(componentInfo);
				this._domNode.style.right = `0px`;
				this._domNode.style.height = `${codeEditor.getLayoutInfo().contentHeight}px`;

				this._infoSection.setTitle('属性');
				for (const key in componentInfo.props) {
					const prop = componentInfo.props[key];
					this._infoSection.addProp(key, prop);
				}

				this._infoSection.onChangeValue = (event: ValueChangeEvent) => {
					let identifiedSingleEditOperationList: Array<IIdentifiedSingleEditOperation> = ValueEditOperation.textReplace(event);
					this._codeEditor.executeEdits('react-props', identifiedSingleEditOperationList);
				};
				this._infoSection.setVisble(true);
				this._isVisible = true;
			}
		});
	}

	private buildReferInfoSection(jsxElement: JSXElement) {
		// 当前打开文件的地址
		let activeEditorFilePath = path.dirname(this.workbenchEditorService.getActiveEditorInput().getResource().fsPath);
		let importURI = URI.file(path.resolve(activeEditorFilePath, jsxElement.importPath));
		console.log('importURI');
		console.log(importURI);
		this.fileService.resolveContent(importURI).then(data => {
			console.log('resolveContent');
			let innnerComponentInfo = parse(data.value);
			console.log(innnerComponentInfo);
			this._referComponentInfoSection.setTitle(`${jsxElement.elementName} 组件信息`);
			for (const key in innnerComponentInfo.props) {
				const prop = innnerComponentInfo.props[key];
				this._referComponentInfoSection.addProp(key, prop);
			}
			this._referComponentInfoSection.setJSXElement(jsxElement);
			// this._referComponentInfoSection.
			this._referComponentInfoSection.setVisble(true);
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