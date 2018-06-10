/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/simulationView';
import { TPromise } from 'vs/base/common/winjs.base';
import { IAction } from 'vs/base/common/actions';
import { Dimension, Builder } from 'vs/base/browser/builder';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { RefreshAction, CollapseDeepestExpandedLevelAction, ClearSearchResultsAction, CancelSearchAction } from 'vs/workbench/parts/search/browser/searchActions';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IPanel } from 'vs/workbench/common/panel';
import { IViewlet } from 'vs/workbench/common/viewlet';
import { Viewlet } from 'vs/workbench/browser/viewlet';
import { IPartService } from 'vs/workbench/services/part/common/partService';


export const VIEW_ID = 'workbench.view.simulation';

export class SimulationView extends Viewlet implements IViewlet, IPanel {

	// private viewletVisible: IContextKey<boolean>;

	private actions: (RefreshAction | CollapseDeepestExpandedLevelAction | ClearSearchResultsAction | CancelSearchAction)[] = [];

	private changedWhileHidden: boolean;



	constructor(
		@IPartService partService: IPartService,
		@ITelemetryService telemetryService: ITelemetryService,
		@ICodeEditorService private codeEditorService: ICodeEditorService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IThemeService protected themeService: IThemeService,
	) {
		super(VIEW_ID, partService, telemetryService, themeService);
		// this.viewletVisible = Constants.SearchViewVisibleKey.bindTo(contextKeyService);
		// this.viewletSettings = this.getMemento(storageService, Scope.WORKSPACE);
		// this.toUnbind.push(this.untitledEditorService.onDidChangeDirty(e => this.onUntitledDidChangeDirty(e)));
		// this.toUnbind.push(this.contextService.onDidChangeWorkbenchState(() => this.onDidChangeWorkbenchState()));
	}

	addReciveMessageListener () {
		window.addEventListener('message', (e) => {
			// 不能这么简单粗暴的获取第 0 个 codeeditor
			console.log('接受到的信息是：' + e);
			if (e.data.type === 'clickLocation') {
				let codeEditor = this.codeEditorService.listCodeEditors()[0];
				console.log(this.codeEditorService.listCodeEditors());
				codeEditor.setPosition({
					lineNumber: e.data.data.line,
					column: e.data.data.column
				});
			}



		}, false);
	}
	public create(parent: Builder): TPromise<void> {
		super.create(parent);
		let builder: Builder;
		parent.div({
			'class': 'simulation-view'
		}, (div) => {
			builder = div;
			let webview = document.createElement('iframe');
			webview.className = 'simulation-view-webview';
			webview.src = 'http://localhost:3000/';
			builder.append(webview);

			this.addReciveMessageListener();
		});

		this.actions = [
			this.instantiationService.createInstance(RefreshAction, RefreshAction.ID, RefreshAction.LABEL),
			this.instantiationService.createInstance(CollapseDeepestExpandedLevelAction, CollapseDeepestExpandedLevelAction.ID, CollapseDeepestExpandedLevelAction.LABEL),
			this.instantiationService.createInstance(ClearSearchResultsAction, ClearSearchResultsAction.ID, ClearSearchResultsAction.LABEL)
		];

		return TPromise.as(null);
	}



	public setVisible(visible: boolean): TPromise<void> {
		let promise: TPromise<void>;
		// this.viewletVisible.set(visible);
		if (visible) {
			if (this.changedWhileHidden) {
				// Render if results changed while viewlet was hidden - #37818
				this.changedWhileHidden = false;
			}

			promise = super.setVisible(visible);
		} else {
			promise = super.setVisible(visible);
		}

		return promise;
	}


	public layout(dimension: Dimension): void {
		// this.size = dimension;
	}

	public getActions(): IAction[] {
		return this.actions;
	}
}
