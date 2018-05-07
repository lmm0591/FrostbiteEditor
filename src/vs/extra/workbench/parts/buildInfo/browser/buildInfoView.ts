/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/buildInfoView';
import { TPromise } from 'vs/base/common/winjs.base';
// import errors = require('vs/base/common/errors');
// import URI from 'vs/base/common/uri';
// import * as dom from 'vs/base/browser/dom';
// import { exec } from 'child_process';

// import { workspace as Workspace, ViewColumn, OutputChannel, window as Window } from 'vs/workbench/api/node/extHost.api.impl';
// import { IOutputService } from 'vs/workbench/parts/output/common/output';
// import { OutputService } from 'vs/workbench/parts/output/electron-browser/outputServices';
import { IAction } from 'vs/base/common/actions';
import { Dimension, Builder } from 'vs/base/browser/builder';
import { SearchModel, ISearchWorkbenchService } from 'vs/workbench/parts/search/common/searchModel';

import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
// import { IContextKey } from 'vs/platform/contextkey/common/contextkey';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { RefreshAction, CollapseDeepestExpandedLevelAction, ClearSearchResultsAction, CancelSearchAction } from 'vs/workbench/parts/search/browser/searchActions';
// import { IUntitledEditorService } from 'vs/workbench/services/untitled/common/untitledEditorService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
// import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IPanel } from 'vs/workbench/common/panel';
import { IViewlet } from 'vs/workbench/common/viewlet';
import { Viewlet } from 'vs/workbench/browser/viewlet';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { Button, ButtonGroup } from 'vs/base/browser/ui/button/button';
import { ITerminalService } from 'vs/workbench/parts/terminal/common/terminal';

// import { Checkbox } from 'vs/base/browser/ui/checkbox/checkbox';
/*
const outputChannel: OutputChannel = Window.createOutputChannel('npm');
export interface ChildCommand {
	'child': ChildProcess;
	'cmd': string;
	'killedByUs'?: boolean;
}

export const childs: Map<number, ChildCommand> = new Map();

export function runCommand (args: string[]) {


    const cmd = 'npm ' + args.join(' ');
	const options = {
		cwd: Workspace.rootPath,
		env: process.env
	};

    const child = exec(cmd, options);

    childs.set(child.pid, { child: child, cmd: cmd });

    child.on('exit', (code, signal) => {

        if (signal === 'SIGTERM' || childs.get(child.pid).killedByUs) {
            outputChannel.appendLine('');
            outputChannel.appendLine('Successfully killed process');
            outputChannel.appendLine('');
            outputChannel.appendLine('--------------------')
            outputChannel.appendLine('');
        }

        if (code === 0) {
            outputChannel.appendLine('');
            outputChannel.appendLine('--------------------')
            outputChannel.appendLine('');
            outputChannel.hide();
        }

        childs.delete(child.pid);
    });

    outputChannel.appendLine(cmd);
    outputChannel.appendLine('');

    const append = function (data) {

        outputChannel.append(data);
    };

    child.stderr.on('data', append);
    child.stdout.on('data', append);
    outputChannel.show(ViewColumn.Three);
};
*/

export const VIEW_ID = 'workbench.view.buildInfo';

export class BuildInfoView extends Viewlet implements IViewlet, IPanel {

	private viewModel: SearchModel;

	// private viewletVisible: IContextKey<boolean>;

	private actions: (RefreshAction | CollapseDeepestExpandedLevelAction | ClearSearchResultsAction | CancelSearchAction)[] = [];

	private changedWhileHidden: boolean;



	constructor(
		@IPartService partService: IPartService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@ISearchWorkbenchService private searchWorkbenchService: ISearchWorkbenchService,
		@IThemeService protected themeService: IThemeService,
		@IWorkspaceContextService private workspaceContextService: IWorkspaceContextService,
		// @IOutputService private outputService: IOutputService,
		@ITerminalService private terminalService: ITerminalService
	) {
		super(VIEW_ID, partService, telemetryService, themeService);

		// this.viewletVisible = Constants.SearchViewVisibleKey.bindTo(contextKeyService);
		// this.viewletSettings = this.getMemento(storageService, Scope.WORKSPACE);
		// this.toUnbind.push(this.untitledEditorService.onDidChangeDirty(e => this.onUntitledDidChangeDirty(e)));
		// this.toUnbind.push(this.contextService.onDidChangeWorkbenchState(() => this.onDidChangeWorkbenchState()));

	}


	public create(parent: Builder): TPromise<void> {
		super.create(parent);
		this.viewModel = this.searchWorkbenchService.searchModel;
		let builder: Builder;
		parent.div({
			'class': 'build-view'
		}, (div) => {
			builder = div;
			let infoDiv = document.createElement('div');
			infoDiv.className = 'build-row';
			infoDiv.innerHTML = '<div>项目名：ae-example</div><div>项目版本号：1.0.0</div><div>构建情况：构建完成</div><div>浏览地址：<a > http://192.168.133.1:5000/#/</a></div>';

			let langDiv = document.createElement('div');
			langDiv.className = 'build-row';
			langDiv.innerHTML = '项目语言： &nbsp;&nbsp;<input type="checkbox" checked />中文 <input type="checkbox" />英文';

			let skinDiv = document.createElement('div');
			langDiv.className = 'build-row';
			skinDiv.innerHTML = '项目皮肤： &nbsp;&nbsp;<select><option>默认</option><option>深蓝</option></select>';

			/*
			let runLogDiv = document.createElement('div');
			runLogDiv.innerHTML = `运行日志:`;
			*/
			let buttonGroupDiv = document.createElement('div');
			buttonGroupDiv.className = 'publish-button-group';

			// let button1: Button = new Button(buttonGroupDiv);
			// button1.label = '保存1';

			let button2: Button = new Button(buttonGroupDiv);
			button2.label = '初始化';
			button2.onDidClick(e => {
				let path1 = this.workspaceContextService.getWorkspace().folders[0].uri.fsPath
				console.log(path1);
				this.terminalService.showPanel(true);
				// console.log(this.terminalService.getActiveInstance())
				this.terminalService.getActiveInstance().sendText('npm install', true);
			});

			let button3: Button = new Button(buttonGroupDiv);
			button3.label = '本地预览';
			button3.onDidClick(e => {
				let path1 = this.workspaceContextService.getWorkspace().folders[0].uri.fsPath
				console.log(path1);
				this.terminalService.showPanel(true);
				// console.log(this.terminalService.getActiveInstance())
				this.terminalService.getActiveInstance().sendText('npm run start', true);
				/*
				let s = this.terminalService.createInstance({
					name: 'lmm',
					cwd: path1,
					executable: 'cmd',
					args: ['npm', 'install']
				});
				s.onExit(e => {
					debugger
					console.log(e);
				});
				*/
				// runCommand(['npm', 'install']);

				// console.log(this.workspaceContextService.getWorkspace());
				/*
				let outputChannel = this.outputService.getActiveChannel();
				// outputChannel.append('adsfasdf');
				function runCommand (args: string[]) {
					const cmd = 'npm ' + args.join(' ');
					const options = {
						cwd: path1,
						env: process.env
					};

					const child = exec(cmd, options);
					// let childs = new Map();
					// childs.set(child.pid, { child: child, cmd: cmd });

					child.on('exit', (code, signal) => {

// || childs.get(child.pid).killedByUs
						if (signal === 'SIGTERM') {
							outputChannel.append('\r\n');
							outputChannel.append('Successfully killed process');
							outputChannel.append('');
							outputChannel.append('--------------------');
							outputChannel.append('');
						}

						if (code === 0) {
							outputChannel.append('');
							outputChannel.append('--------------------');
							outputChannel.append('');
							// outputChannel.hide();
						}

						// childs.delete(child.pid);
					});

					outputChannel.append(cmd);
					outputChannel.append('');

					const append = function (data) {

						outputChannel.append(data);
					};

					child.stderr.on('data', append);
					child.stdout.on('data', append);
					// outputChannel.show(ViewColumn.Three);
				}
				runCommand(['install']);
*/
			})

			let button4: Button = new Button(buttonGroupDiv);
			button4.label = '发布';
			let buttonGroup: ButtonGroup = new ButtonGroup(buttonGroupDiv, 0);

			// buttonGroup.buttons.push(button1);
			buttonGroup.buttons.push(button2);
			buttonGroup.buttons.push(button3);
			buttonGroup.buttons.push(button4);

			// builder.append(langDiv);
			// builder.append(skinDiv);
			// builder.append(runLogDiv);
			builder.append(infoDiv);

			builder.append(buttonGroupDiv);

		});
		// builder.innerHtml('<h3>项目名: ae-example</h3><div><input type="button" value="构建" /></div>');

		// builder.innerHtml()
			// document.createElement('div');
		// dom.$('div')
		/*
		builder.div({
			'class': 'build-view-content'
		}).append()
*/
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

		// Enable highlights if there are searchresults
		if (this.viewModel) {
			this.viewModel.searchResult.toggleHighlights(visible);
		}

		return promise;
	}


	public layout(dimension: Dimension): void {
		// this.size = dimension;
	}

	public getActions(): IAction[] {
		return this.actions;
	}

	public shutdown(): void {

		super.shutdown();
	}

	public dispose(): void {
		// this.isDisposed = true;

		this.viewModel.dispose();

		super.dispose();
	}
}
