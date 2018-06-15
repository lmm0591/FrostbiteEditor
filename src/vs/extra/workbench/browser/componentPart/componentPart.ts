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

import { IThemeService } from 'vs/platform/theme/common/themeService';
import { PropRow } from 'vs/extra/component/propSection/propRow';
import { IComponentPartService } from 'vs/extra/workbench/services/component/common/componentPartService';

import { PropSection } from 'vs/extra/component/propSection/propSection';


export class ComponentPart extends Part implements IComponentPartService {

	// public static readonly activePanelSettingsKey = 'workbench.componentPart.activepanelid';
	private propSection: PropSection;
	private element: HTMLElement;
	private dimension: Dimension;

	constructor(
		id: string,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IPartService private partService: IPartService,
		@IWorkbenchEditorService private workbenchEditorService: IWorkbenchEditorService,
		@IThemeService themeService: IThemeService
	) {
		super(id, { hasTitle: true }, themeService);
	}

	public create(parent: Builder): void {
		super.create(parent);
		this.propSection = this.instantiationService.createInstance(PropSection);

		this.propSection.setTitle('属性');
		this.element = document.createElement('div');
		this.element.className = 'FE-component-part';
		this.element.setAttribute('aria-hidden', 'true');
		this.element.appendChild(this.propSection.element);


		this.getContainer().getHTMLElement().appendChild(this.element);
		this.registerListeners();
	}

	private registerListeners(): void {
		console.log(this.workbenchEditorService);
		let key = 'name';
		const propRow = new PropRow({
			label: key,
			type: 'string',
			value: '李明敏',
			description: '我是备注'
		});
		this.propSection.addProp(key, propRow);
	}

	public layout(dimension: Dimension): Dimension[] {

		if (!this.partService.isVisible(Parts.COMPONENT_PART)) {
			return [dimension];
		}

		this.dimension = dimension;
		const sizes = super.layout(this.dimension);

		return sizes;
	}
}
