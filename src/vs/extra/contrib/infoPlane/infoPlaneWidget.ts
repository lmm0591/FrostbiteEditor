/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./styles/infoPlaneWidget';
import { IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { FindInput } from 'vs/base/browser/ui/findinput/findInput';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { Widget } from 'vs/base/browser/ui/widget';
import URI from 'vs/base/common/uri';
import { Sash, IHorizontalSashLayoutProvider } from 'vs/base/browser/ui/sash/sash';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, OverlayWidgetPositionPreference } from 'vs/editor/browser/editorBrowser';
import { FindReplaceState } from 'vs/editor/contrib/find/findState';
import { ComponentSection } from 'vs/extra/contrib/infoPlane/componentSection';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IIdentifiedSingleEditOperation } from 'vs/editor/common/model';
import { ValueEditOperation } from 'vs/extra/common/core/valueEditOperation';
import { Position } from 'vs/editor/common/core/position';
import { ComponentProp } from 'vs/extra/contrib/infoPlane/componentProp';
import { TextEdit } from 'vs/editor/common/modes';
import * as path from 'path';
// TODO: 最好要暴露 AST 方便重构代码
import { parse, operation } from 'react-analysis';
import * as recast from 'recast';

const FIND_WIDGET_INITIAL_WIDTH = 300;
const LINE_POS_MAX = 1000000; // 计算位置坐标，先把行乘以足够大的数，这样好计算

export interface ValueChangeEvent {
	key: string;
	value: string;
}

export class InfoPlaneWidget extends Widget implements IOverlayWidget, IHorizontalSashLayoutProvider {
	private static readonly ID = 'editor.contrib.infoPlaneWidget';
	private _codeEditor: ICodeEditor;

	private _domNode: HTMLElement;
	private _findInput: FindInput;
	private _replaceInputBox: InputBox;
	private _componentSection: ComponentSection;
	private _referComponentSection: ComponentSection;
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
		console.log(operation);
		this._codeEditor = codeEditor;
		this._isVisible = false;
		this.buildDomNode();
		// 初始当前组件信息
		this._componentSection = new ComponentSection();
		this._componentSection.onChangeValue = (event: ValueChangeEvent) => {
			console.log('onChangeValue');
			console.log(event);
			let code = this._codeEditor.getValue();
			var ast = parse(code).ast;
			operation.defaultProps.setDefaultProps(ast, event.key, event.value);
			this._codeEditor.setValue(recast.print(ast.program).code);
		};

		this._domNode.appendChild(this._componentSection.domNode);

		// 初始引用组件信息
		this._referComponentSection = new ComponentSection();
		this._domNode.appendChild(this._referComponentSection.domNode);

		this._referComponentSection.onChangeValue = (event: ValueChangeEvent) => {
			console.log('引用组件修改事件---event');
			console.log(event);
			let jsxElement = this.getInPositionJSXElement(this._codeEditor.getValue(), this._codeEditor.getPosition());
			console.log(jsxElement);

			let keyIdentifier = recast.types.builders.jsxIdentifier(event.key);
			let valueLiteral = recast.types.builders.literal(event.value);
			let originalJSXElement: JSXElement = jsxElement.original;
			let attribute: JSXElementAttribute = originalJSXElement.openingElement.attributes.filter(attribute => attribute.name.name === event.key)[0];
			if (attribute) {
				attribute.value = valueLiteral;
			} else {
				let newJSXElementArrt = recast.types.builders.jsxAttribute(keyIdentifier, valueLiteral);
				originalJSXElement.openingElement.attributes.push(newJSXElementArrt);
			}
			var code = recast.print(originalJSXElement).code;
			const textEdit: TextEdit = {
				text: code,
				range: {
					endColumn: originalJSXElement.loc.end.column + 1,
					endLineNumber: originalJSXElement.loc.end.line,
					startColumn: originalJSXElement.loc.start.column + 1,
					startLineNumber: originalJSXElement.loc.start.line
				}
			};
			let identifiedSingleEditOperationList: Array<IIdentifiedSingleEditOperation> = ValueEditOperation.textReplace(textEdit);
			this._codeEditor.executeEdits('react-props', identifiedSingleEditOperationList);
		};

		this._codeEditor.addOverlayWidget(this);
		this._codeEditor.onDidDispose(() => {

		});

		this._codeEditor.onDidChangeCursorPosition(e => {
			console.log('onDidChangeCursorPosition');
			console.log(e);
			let jsxElement = this.getInPositionJSXElement(this._codeEditor.getValue(), e.position);
			if (jsxElement) {
				var attr = this.getOpeningElementAttr(jsxElement);
				this.buildReferInfoSection(jsxElement, attr);
				this._referComponentSection.setVisble(true);
			} else {
				this._referComponentSection.setVisble(false);
			}
		});


		this._codeEditor.onDidChangeModelContent(e => {
			console.log('onDidChangeModelContent');
			var componentInfo = parse(this._codeEditor.getValue());
			console.log(componentInfo);
			this._componentSection.clearPropAll();
			this.buildSelfSection(componentInfo.props);
		});

		this._codeEditor.onDidFocusEditor(() => {
			if (this._isVisible === false) {
				var componentInfo = parse(this._codeEditor.getValue());
				this._domNode.style.right = `0px`;
				this._domNode.style.height = `${codeEditor.getLayoutInfo().contentHeight}px`;

				this._componentSection.setTitle('属性');
				console.log(componentInfo);
				this._componentSection.clearPropAll();
				this.buildSelfSection(componentInfo.props);
				this._componentSection.setVisble(true);
				this._isVisible = true;
			}
		});
	}

	private buildSelfSection(props) {
		for (let key in props) {
			let prop = props[key];
			let data = [];
			let type = prop.type ? prop.type.name : 'string';
			console.log(`prop-type-${type}`);
			console.log(prop);
			switch (type) {
				case 'enum':
					prop.type.value.forEach(item => data.push({ label: item.value, value: item.value }));
					break;
				case 'bool':
					data.push({ label: true, value: true });
					data.push({ label: false, value: false });
					break;
				case 'string':
					if (prop.defaultValue) {
						let value = prop.defaultValue.value.replace(/\\['"]/g, '"'); // 转换 " 字符
						value =	value.replace(/^['"]/, '').replace(/['"]$/, ''); // 删除头尾的的字符
						prop.defaultValue.value = value;
					}
					break;
				case 'number':
					break;
				default:
					break;
			}
			const componentProp = new ComponentProp({
				label: key, type, data,
				value: prop.defaultValue ? prop.defaultValue.value : '',
				description: prop.description
			});
			this._componentSection.addProp(key, componentProp);
		}
	}

	private buildReferInfoSection(jsxElement: JSXElement, initAttributes) {
		// 当前打开文件的地址
		let activeEditorFilePath = path.dirname(this.workbenchEditorService.getActiveEditorInput().getResource().fsPath);
		let importURI = URI.file(path.resolve(activeEditorFilePath, jsxElement.importPath));
		console.log('importURI');
		console.log(importURI);
		this.fileService.resolveContent(importURI).then(data => {
			console.log('resolveContent');
			let innnerComponentInfo = parse(data.value);
			console.log(innnerComponentInfo);
			// this._referComponentSection.clearPropAll();
			this._referComponentSection.setTitle(`${jsxElement.elementName} 组件信息`);

			let initAttributeMap = {};
			initAttributes.forEach(initAttr => initAttributeMap[initAttr.name] = initAttr.value);
			let initAttrNames = Object.keys(initAttributeMap);

			for (const key in innnerComponentInfo.props) {
				let value = '';
				if (initAttrNames.indexOf(key) >= 0) {
					value = initAttributeMap[key];
				} else {
					let prop = innnerComponentInfo.props[key];
					value = prop.defaultValue ? prop.defaultValue.value : '';
				}
				this._referComponentSection.setProp(key, value);
			}
			this._referComponentSection.setVisble(true);
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

	 buildDomNode(): void {
		// Widget
		this._domNode = document.createElement('div');
		this._domNode.className = 'editor-widget info-plane-widget';
		this._domNode.setAttribute('aria-hidden', 'true');
		// We need to set this explicitly, otherwise on IE11, the width inheritence of flex doesn't work.
		this._domNode.style.width = `${FIND_WIDGET_INITIAL_WIDTH}px`;
		this._domNode.style.right = '0px';
		this._domNode.innerHTML = '<h2>属性库</h2>';
	}


	getOpeningElementAttr(jsxElement: JSXElement) {
		let elementAttr = [];
		jsxElement.openingElement.attributes.forEach(element => {
			var value = element.value.type === 'JSXExpressionContainer' ? element.value.expression.name : element.value.raw
			elementAttr.push({
				name: element.name.name,
				value: value,
				type: element.value.type
			});
		});
		return elementAttr;
	}


	getInPositionJSXElement (code: string, position: Position): JSXElement {
		var componentInfo = parse(code);
		var result = null;
		componentInfo.jsxElements.some(jsxElement => {
			let start = jsxElement.loc.start.line * LINE_POS_MAX + jsxElement.loc.start.column;
			let end = jsxElement.loc.end.line * LINE_POS_MAX + jsxElement.loc.end.column;
			let cursorPos = position.lineNumber * LINE_POS_MAX + position.column;
			if (jsxElement.importPath && start <= cursorPos && end >= cursorPos) {
				console.log('pos');
				console.log(jsxElement);
				result = jsxElement;
				return true;
			}
			return false;
		});
		return result;
	}

}