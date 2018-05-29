/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { HistoryNavigator } from 'vs/base/common/history';
import { Disposable } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { FindModelBoundToEditorModel } from 'vs/editor/contrib/find/findModel';
import { FindReplaceState } from 'vs/editor/contrib/find/findState';
import { Delayer } from 'vs/base/common/async';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IFileService } from 'vs/platform/files/common/files';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { InfoPlaneWidget } from 'vs/extra/contrib/infoPlane/infoPlaneWidget';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
// import { IFileService } from 'vs/workbench/services/files/electron-browser/fileService';

import { IThemeService } from 'vs/platform/theme/common/themeService';

export function getSelectionSearchString(editor: ICodeEditor): string {
	let selection = editor.getSelection();

	if (selection.startLineNumber === selection.endLineNumber) {
		if (selection.isEmpty()) {
			let wordAtPosition = editor.getModel().getWordAtPosition(selection.getStartPosition());
			if (wordAtPosition) {
				return wordAtPosition.word;
			}
		} else {
			return editor.getModel().getValueInRange(selection);
		}
	}

	return null;
}

export const enum FindStartFocusAction {
	NoFocusChange,
	FocusFindInput,
	FocusReplaceInput
}

export interface IFindStartOptions {
	forceRevealReplace: boolean;
	seedSearchStringFromSelection: boolean;
	seedSearchStringFromGlobalClipboard: boolean;
	shouldFocus: FindStartFocusAction;
	shouldAnimate: boolean;
}

export class InfoPlaneController extends Disposable implements editorCommon.IEditorContribution {

	private static readonly ID = 'editor.contrib.infoPlaneController';

	protected _editor: ICodeEditor;
	protected _state: FindReplaceState;
	private _currentHistoryNavigator: HistoryNavigator<string>;
	protected _updateHistoryDelayer: Delayer<void>;
	private _model: FindModelBoundToEditorModel;

	// private _widget: InfoPlaneWidget;

	public static get(editor: ICodeEditor): InfoPlaneController {
		return editor.getContribution<InfoPlaneController>(InfoPlaneController.ID);
	}

	constructor(
		editor: ICodeEditor,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IContextViewService private readonly _contextViewService: IContextViewService,
		@IKeybindingService private readonly _keybindingService: IKeybindingService,
		@IThemeService private readonly _themeService: IThemeService,
		@IFileService private readonly _fileService: IFileService,
		@IWorkbenchEditorService private readonly _workbenchEditorService: IWorkbenchEditorService
	) {
		super();
		this._editor = editor;
		this._updateHistoryDelayer = new Delayer<void>(500);
		this._currentHistoryNavigator = new HistoryNavigator<string>();
		this._model = null;

		// this._widget = this._register(new InfoPlaneWidget(this._editor, this, this._state, this._contextViewService, this._keybindingService, contextKeyService, this._themeService));
		this._register(new InfoPlaneWidget(this._editor, this._state, this._contextViewService, this._keybindingService, contextKeyService, this._themeService, this._fileService, this._workbenchEditorService));
	}

	public dispose(): void {
		this.disposeModel();
		super.dispose();
	}

	private disposeModel(): void {
		if (this._model) {
			this._model.dispose();
			this._model = null;
		}
	}

	public getId(): string {
		return InfoPlaneController.ID;
	}


	protected _delayedUpdateHistory() {
		this._updateHistoryDelayer.trigger(this._updateHistory.bind(this));
	}

	protected _updateHistory() {
		if (this._state.searchString) {
			this._currentHistoryNavigator.add(this._state.searchString);
		}
	}

	protected _start(opts: IFindStartOptions): void {
		this.disposeModel();
	}

}

registerEditorContribution(InfoPlaneController);