/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { Dimension, Builder } from 'vs/base/browser/builder';
import { Part } from 'vs/workbench/browser/part';
import { IPartService, Parts } from 'vs/workbench/services/part/common/partService';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditorPart } from 'vs/workbench/browser/parts/editor/editorPart';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { Position } from 'vs/editor/common/core/position';
import { IFileService } from 'vs/platform/files/common/files';
import * as path from 'path';
import URI from 'vs/base/common/uri';
import { PropRow } from 'vs/extra/component/propSection/propRow';
import { IComponentPartService } from 'vs/extra/workbench/services/component/common/componentPartService';
import { PropSection } from 'vs/extra/component/propSection/propSection';
import { parse } from 'react-analysis';
// import * as recast from 'recast';

const LINE_POS_MAX = 1000000; // 计算位置坐标，先把行乘以足够大的数，这样好计算

function filterQuotation (text: string): string {
	text = text.replace(/\\['"]/g, '"'); // 转换 " 字符
	return text.replace(/^['"]/, '').replace(/['"]$/, ''); // 删除头尾 " 字符
}

function buildPropSection(propSection: PropSection, props: Object) {
	propSection.clearPropAll();
	for (let key in props) {
		let prop = props[key];
		let data = [];
		let type = prop.type ? prop.type.name : 'string';
		switch (type) {
			case 'enum':
				prop.type.value.forEach(item => {
					const value = filterQuotation(item.value);
					data.push({ label: value, value });
				});
				break;
			case 'bool':
				data.push({ label: true, value: true });
				data.push({ label: false, value: false });
				break;
			case 'string':
				if (prop.defaultValue) {
					prop.defaultValue.value = filterQuotation(prop.defaultValue.value);
				}
				break;
			case 'number':
				break;
			default:
				break;
		}
		const value = prop.defaultValue ? prop.defaultValue.value : '';
		const propRow = new PropRow({
			label: key, type, data,
			value: filterQuotation(value),
			description: prop.description
		});
		propSection.addProp(key, propRow);
	}
}


export class ComponentPart extends Part implements IComponentPartService {

	// public static readonly activePanelSettingsKey = 'workbench.componentPart.activepanelid';
	private selfPropSection: PropSection;
	private jsxPropSection: PropSection;
	// TODO: 方法列表待完成
	// private methodSection : PropSection;
	private element: HTMLElement;
	private dimension: Dimension;

	constructor(
		id: string,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IPartService private partService: IPartService,
		@IFileService private readonly fileService: IFileService,
		// @IEditorService private editorService: IEditorService,
		@IWorkbenchEditorService private workbenchEditorService: IWorkbenchEditorService,
		@IThemeService themeService: IThemeService
	) {
		super(id, { hasTitle: true }, themeService);
	}

	public create(parent: Builder): void {
		super.create(parent);
		this.selfPropSection = this.instantiationService.createInstance(PropSection);
		this.selfPropSection.setTitle('属性');

		this.jsxPropSection = this.instantiationService.createInstance(PropSection);
		this.jsxPropSection.setTitle('jsx 属性');
		this.jsxPropSection.setVisble(false);

		this.element = document.createElement('div');
		this.element.className = 'FE-component-part';
		this.element.setAttribute('aria-hidden', 'true');
		this.element.appendChild(this.selfPropSection.element);
		this.element.appendChild(this.jsxPropSection.element);

		this.getContainer().getHTMLElement().appendChild(this.element);
		this.registerListeners();
	}

	private registerListeners(): void {
		let editorPart = this.workbenchEditorService['editorPart'] as EditorPart;
		editorPart.onEditorsChanged(() => {
			console.log('editor 文本加载成功');
			const editorControl = (<ICodeEditor>this.workbenchEditorService.getActiveEditor().getControl());
			let code = editorControl.getValue();
			var componentInfo = null;
			try {
				componentInfo = parse(code);
			} catch { }
			if (componentInfo) {
				this.buildSelfSection(componentInfo.props);
			}

			editorControl.onDidChangeModelContent(() => {
				console.log('editor 文本修改');
				let code = editorControl.getValue();
				var componentInfo = null;
				try {
					componentInfo = parse(code);
				} catch { }
				if (componentInfo) {
					this.buildSelfSection(componentInfo.props);
				}
			});

			editorControl.onDidChangeCursorPosition(event => {
				console.log('onDidChangeCursorPosition');
				// TODO: 事件没有释放
				let code = editorControl.getValue();
				let jsxElement = this.getInPositionJSXElement(code, event.position);
				if (jsxElement) {
					var attr = this.getOpeningElementAttr(jsxElement);
					this.buildJSXSection(jsxElement, attr);
					this.jsxPropSection.setVisble(true);
				} else {
					this.jsxPropSection.setVisble(false);
				}
			});
		});

	}

	public layout(dimension: Dimension): Dimension[] {

		if (!this.partService.isVisible(Parts.COMPONENT_PART)) {
			return [dimension];
		}

		this.dimension = dimension;
		const sizes = super.layout(this.dimension);

		return sizes;
	}

	private buildSelfSection(props) {
		buildPropSection(this.selfPropSection, props);
	}

	private buildJSXSection(jsxElement: JSXElement, initAttrs) {
		// 当前打开文件的地址
		let activeEditorFilePath = path.dirname(this.workbenchEditorService.getActiveEditorInput().getResource().fsPath);
		// TODO: 频繁读去文件，性能有问题
		let importURI = URI.file(path.resolve(activeEditorFilePath, jsxElement.importPath));
		console.log('importURI');
		this.fileService.resolveContent(importURI).then(data => {
			console.log('resolveContent');
			let jsxComponentInfo = parse(data.value);
			this.jsxPropSection.setTitle(`${jsxElement.elementName} 组件信息`);

			let initAttrMap = {};
			initAttrs.forEach(initAttr => initAttrMap[initAttr.name] = initAttr.value);
			let initAttrNames = Object.keys(initAttrMap);

			for (const key in jsxComponentInfo.props) {
				let prop = jsxComponentInfo.props[key];
				if (initAttrNames.indexOf(key) >= 0) {
					prop.defaultValue = { value: initAttrMap[key] };
				}
			}
			console.log('buildJSXSection');
			// console.log(jsxComponentInfo.props);
			buildPropSection(this.jsxPropSection, jsxComponentInfo.props);
			this.jsxPropSection.setVisble(true);
		});
	}
	// TODO: 应该在 react-analysis 操作
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

	getInPositionJSXElement(code: string, position: Position): JSXElement {
		try {
			var componentInfo = parse(code);
			var result = null;
			componentInfo.jsxElements.some(jsxElement => {
				let start = jsxElement.loc.start.line * LINE_POS_MAX + jsxElement.loc.start.column;
				let end = jsxElement.loc.end.line * LINE_POS_MAX + jsxElement.loc.end.column;
				let cursorPos = position.lineNumber * LINE_POS_MAX + position.column;
				if (jsxElement.importPath && start <= cursorPos && end >= cursorPos) {
					result = jsxElement;
					return true;
				}
				return false;
			});
			return result;
		} catch{
			return null;
		}

	}
}
