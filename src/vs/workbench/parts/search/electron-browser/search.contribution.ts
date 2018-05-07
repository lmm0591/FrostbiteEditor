/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/search.contribution';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';

import { registerContributions as replaceContributions } from 'vs/workbench/parts/search/browser/replaceContributions';

import { ISearchWorkbenchService, SearchWorkbenchService } from 'vs/workbench/parts/search/common/searchModel';
registerSingleton(ISearchWorkbenchService, SearchWorkbenchService);
replaceContributions();
// searchWidgetContributions();
/*
const FIND_IN_FOLDER_ID = 'filesExplorer.findInFolder';
CommandsRegistry.registerCommand({
	id: FIND_IN_FOLDER_ID,
	handler: (accessor, resource?: URI) => {
		const listService = accessor.get(IListService);
		const viewletService = accessor.get(IViewletService);
		const panelService = accessor.get(IPanelService);
		const fileService = accessor.get(IFileService);
		const resources = getMultiSelectedResources(resource, listService, accessor.get(IWorkbenchEditorService));

		return openSearchView(viewletService, panelService, true).then(searchView => {
			if (resources && resources.length) {
				return fileService.resolveFiles(resources.map(resource => ({ resource }))).then(results => {
					const folders: URI[] = [];

					results.forEach(result => {
						if (result.success) {
							folders.push(result.stat.isDirectory ? result.stat.resource : dirname(result.stat.resource));
						}
					});

					searchView.searchInFolders(distinct(folders, folder => folder.toString()), (from, to) => relative(from, to));
				});
			}

			return void 0;
		});
	}
});

const FIND_IN_WORKSPACE_ID = 'filesExplorer.findInWorkspace';
CommandsRegistry.registerCommand({
	id: FIND_IN_WORKSPACE_ID,
	handler: (accessor) => {
		return openSearchView(accessor.get(IViewletService), accessor.get(IPanelService), true).then(searchView => {
			searchView.searchInFolders(null, (from, to) => relative(from, to));
		});
	}
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
	group: '4_search',
	order: 10,
	command: {
		id: FIND_IN_FOLDER_ID,
		title: nls.localize('findInFolder', "Find in Folder...")
	},
	when: ContextKeyExpr.and(ExplorerFolderContext, ResourceContextKey.Scheme.isEqualTo(Schemas.file)) // todo@remote
});

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
	group: '4_search',
	order: 10,
	command: {
		id: FIND_IN_WORKSPACE_ID,
		title: nls.localize('findInWorkspace', "Find in Workspace...")
	},
	when: ContextKeyExpr.and(ExplorerRootContext, ExplorerFolderContext.toNegated())
});



// Register View in Viewlet and Panel area
Registry.as<ViewletRegistry>(ViewletExtensions.Viewlets).registerViewlet(new ViewletDescriptor(
	SearchView,
	VIEW_ID,
	nls.localize('name', "Search"),
	'search',
	10
));

Registry.as<PanelRegistry>(PanelExtensions.Panels).registerPanel(new PanelDescriptor(
	SearchView,
	VIEW_ID,
	nls.localize('name', "Search"),
	'search',
	10
));

// Register view location updater
Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).registerWorkbenchContribution(SearchViewLocationUpdater, LifecyclePhase.Running);

// Actions
const registry = Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions);
const category = nls.localize('search', "Search");

registry.registerWorkbenchAction(new SyncActionDescriptor(FindInFilesAction, VIEW_ID, nls.localize('showSearchViewl', "Show Search"), { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_F },
	Constants.SearchViewVisibleKey.toNegated()), 'View: Show Search', nls.localize('view', "View"));

registry.registerWorkbenchAction(new SyncActionDescriptor(FindInFilesAction, Constants.FindInFilesActionId, nls.localize('findInFiles', "Find in Files"), { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_F },
	Constants.SearchInputBoxFocusedKey.toNegated()), 'Find in Files', category);

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: Constants.FocusActiveEditorCommandId,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.SearchInputBoxFocusedKey),
	handler: FocusActiveEditorCommand,
	primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_F
});

registry.registerWorkbenchAction(new SyncActionDescriptor(FocusNextSearchResultAction, FocusNextSearchResultAction.ID, FocusNextSearchResultAction.LABEL, { primary: KeyCode.F4 }), 'Focus Next Search Result', category);
registry.registerWorkbenchAction(new SyncActionDescriptor(FocusPreviousSearchResultAction, FocusPreviousSearchResultAction.ID, FocusPreviousSearchResultAction.LABEL, { primary: KeyMod.Shift | KeyCode.F4 }), 'Focus Previous Search Result', category);

registry.registerWorkbenchAction(new SyncActionDescriptor(ReplaceInFilesAction, ReplaceInFilesAction.ID, ReplaceInFilesAction.LABEL, { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_H }), 'Replace in Files', category);

KeybindingsRegistry.registerCommandAndKeybindingRule(objects.assign({
	id: Constants.ToggleCaseSensitiveCommandId,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.SearchInputBoxFocusedKey),
	handler: toggleCaseSensitiveCommand
}, ToggleCaseSensitiveKeybinding));

KeybindingsRegistry.registerCommandAndKeybindingRule(objects.assign({
	id: Constants.ToggleWholeWordCommandId,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.SearchInputBoxFocusedKey),
	handler: toggleWholeWordCommand
}, ToggleWholeWordKeybinding));

KeybindingsRegistry.registerCommandAndKeybindingRule(objects.assign({
	id: Constants.ToggleRegexCommandId,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.SearchInputBoxFocusedKey),
	handler: toggleRegexCommand
}, ToggleRegexKeybinding));

// Terms navigation actions
registry.registerWorkbenchAction(new SyncActionDescriptor(ShowNextSearchTermAction, ShowNextSearchTermAction.ID, ShowNextSearchTermAction.LABEL, ShowNextFindTermKeybinding, ShowNextSearchTermAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Next Search Term', category);
registry.registerWorkbenchAction(new SyncActionDescriptor(ShowPreviousSearchTermAction, ShowPreviousSearchTermAction.ID, ShowPreviousSearchTermAction.LABEL, ShowPreviousFindTermKeybinding, ShowPreviousSearchTermAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Previous Search Term', category);

registry.registerWorkbenchAction(new SyncActionDescriptor(ShowNextSearchIncludeAction, ShowNextSearchIncludeAction.ID, ShowNextSearchIncludeAction.LABEL, ShowNextFindTermKeybinding, ShowNextSearchIncludeAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Next Search Include Pattern', category);
registry.registerWorkbenchAction(new SyncActionDescriptor(ShowPreviousSearchIncludeAction, ShowPreviousSearchIncludeAction.ID, ShowPreviousSearchIncludeAction.LABEL, ShowPreviousFindTermKeybinding, ShowPreviousSearchIncludeAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Previous Search Include Pattern', category);

registry.registerWorkbenchAction(new SyncActionDescriptor(ShowNextSearchExcludeAction, ShowNextSearchExcludeAction.ID, ShowNextSearchExcludeAction.LABEL, ShowNextFindTermKeybinding, ShowNextSearchExcludeAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Next Search Exclude Pattern', category);
registry.registerWorkbenchAction(new SyncActionDescriptor(ShowPreviousSearchExcludeAction, ShowPreviousSearchExcludeAction.ID, ShowPreviousSearchExcludeAction.LABEL, ShowPreviousFindTermKeybinding, ShowPreviousSearchExcludeAction.CONTEXT_KEY_EXPRESSION), 'Search: Show Previous Search Exclude Pattern', category);

registry.registerWorkbenchAction(new SyncActionDescriptor(CollapseDeepestExpandedLevelAction, CollapseDeepestExpandedLevelAction.ID, CollapseDeepestExpandedLevelAction.LABEL), 'Search: Collapse All', category);

registry.registerWorkbenchAction(new SyncActionDescriptor(ShowAllSymbolsAction, ShowAllSymbolsAction.ID, ShowAllSymbolsAction.LABEL, { primary: KeyMod.CtrlCmd | KeyCode.KEY_T }), 'Go to Symbol in Workspace...');


// Register Quick Open Handler
Registry.as<IQuickOpenRegistry>(QuickOpenExtensions.Quickopen).registerDefaultQuickOpenHandler(
	new QuickOpenHandlerDescriptor(
		OpenAnythingHandler,
		OpenAnythingHandler.ID,
		'',
		defaultQuickOpenContextKey,
		nls.localize('openAnythingHandlerDescription', "Go to File")
	)
);

Registry.as<IQuickOpenRegistry>(QuickOpenExtensions.Quickopen).registerQuickOpenHandler(
	new QuickOpenHandlerDescriptor(
		OpenSymbolHandler,
		OpenSymbolHandler.ID,
		ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX,
		'inWorkspaceSymbolsPicker',
		[
			{
				prefix: ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX,
				needsEditor: false,
				description: nls.localize('openSymbolDescriptionNormal', "Go to Symbol in Workspace")
			}
		]
	)
);

// Configuration
const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
	id: 'search',
	order: 13,
	title: nls.localize('searchConfigurationTitle', "Search"),
	type: 'object',
	properties: {
		'search.exclude': {
			type: 'object',
			description: nls.localize('exclude', "Configure glob patterns for excluding files and folders in searches. Inherits all glob patterns from the files.exclude setting."),
			default: { 'node_modules': true, 'bower_components': true },
			additionalProperties: {
				anyOf: [
					{
						type: 'boolean',
						description: nls.localize('exclude.boolean', "The glob pattern to match file paths against. Set to true or false to enable or disable the pattern."),
					},
					{
						type: 'object',
						properties: {
							when: {
								type: 'string', // expression ({ "/*.js": { "when": "$(basename).js" } })
								pattern: '\\w*\\$\\(basename\\)\\w*',
								default: '$(basename).ext',
								description: nls.localize('exclude.when', 'Additional check on the siblings of a matching file. Use $(basename) as variable for the matching file name.')
							}
						}
					}
				]
			},
			scope: ConfigurationScope.RESOURCE
		},
		'search.useRipgrep': {
			type: 'boolean',
			description: nls.localize('useRipgrep', "Controls whether to use ripgrep in text and file search"),
			default: true
		},
		'search.useIgnoreFiles': {
			type: 'boolean',
			description: nls.localize('useIgnoreFiles', "Controls whether to use .gitignore and .ignore files when searching for files."),
			default: true,
			scope: ConfigurationScope.RESOURCE
		},
		'search.quickOpen.includeSymbols': {
			type: 'boolean',
			description: nls.localize('search.quickOpen.includeSymbols', "Configure to include results from a global symbol search in the file results for Quick Open."),
			default: false
		},
		'search.followSymlinks': {
			type: 'boolean',
			description: nls.localize('search.followSymlinks', "Controls whether to follow symlinks while searching."),
			default: true
		},
		'search.smartCase': {
			type: 'boolean',
			description: nls.localize('search.smartCase', "Searches case-insensitively if the pattern is all lowercase, otherwise, searches case-sensitively"),
			default: false
		},
		'search.globalFindClipboard': {
			type: 'boolean',
			default: false,
			description: nls.localize('search.globalFindClipboard', "Controls if the search view should read or modify the shared find clipboard on macOS"),
			included: platform.isMacintosh
		},
		'search.location': {
			enum: ['sidebar', 'panel'],
			default: 'sidebar',
			description: nls.localize('search.location', "Preview: controls if the search will be shown as a view in the sidebar or as a panel in the panel area for more horizontal space. Next release search in panel will have improved horizontal layout and this will no longer be a preview."),
		},
	}
});

registerLanguageCommand('_executeWorkspaceSymbolProvider', function (accessor, args: { query: string; }) {
	let { query } = args;
	if (typeof query !== 'string') {
		throw illegalArgument();
	}
	return getWorkspaceSymbols(query);
});

*/