/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { escape } from 'vs/base/common/strings';
import { localize } from 'vs/nls';

export function used() {
}

export default () => `
<div class="welcomePageContainer">
	<div class="welcomePage">
		<div class="title">
			<h1 class="caption">${escape(localize('welcomePage.vscode', "Frostbite Editor"))}</h1>
			<p class="subtitle detail">${escape(localize({ key: 'welcomePage.editingEvolved', comment: ['Shown as subtitle on the Welcome page.'] }, "Editing evolved"))}</p>
		</div>
		<div class="row">
			<div class="splash">
				<div class="section start">
					<h2 class="caption">${escape(localize('welcomePage.start', "Start"))}</h2>
					<ul>
						<li><a href="javascript:void(0)" id='showCreate'>新建项目</a></li>
						<li><a href="command:workbench.action.files.newUntitledFile">${escape(localize('welcomePage.newFile', "New file"))}</a></li>
						<li class="mac-only"><a href="command:workbench.action.files.openFileFolder">${escape(localize('welcomePage.openFolder', "Open folder..."))}</a></li>
						<li class="windows-only linux-only"><a href="command:workbench.action.files.openFolder">${escape(localize('welcomePage.openFolder', "Open folder..."))}</a></li>
						<li><a href="command:workbench.action.addRootFolder">${escape(localize('welcomePage.addWorkspaceFolder', "Add workspace folder..."))}</a></li>
					</ul>
				</div>
				<div class="section recent">
					<h2 class="caption">项目列表</h2>
					<ul class="list">
						<!-- Filled programmatically -->
						<li class="moreRecent"><a href="command:workbench.action.openRecent">${escape(localize('welcomePage.moreRecent', "More..."))}</a><span class="path detail if_shortcut" data-command="workbench.action.openRecent">(<span class="shortcut" data-command="workbench.action.openRecent"></span>)</span></li>
					</ul>
					<p class="none detail">${escape(localize('welcomePage.noRecentFolders', "No recent folders"))}</p>
				</div>
				<div class="section help">
					<h2 class="caption">${escape(localize('welcomePage.help', "Help"))}</h2>
					<ul>
						<li class="keybindingsReferenceLink"><a href="command:workbench.action.keybindingsReference">${escape(localize('welcomePage.keybindingsCheatsheet', "Printable keyboard cheatsheet"))}</a></li>
						<li><a href="command:workbench.action.openIntroductoryVideosUrl">${escape(localize('welcomePage.introductoryVideos', "Introductory videos"))}</a></li>
						<li><a href="command:workbench.action.openTipsAndTricksUrl">${escape(localize('welcomePage.tipsAndTricks', "Tips and Tricks"))}</a></li>
						<li><a href="command:workbench.action.openDocumentationUrl">${escape(localize('welcomePage.productDocumentation', "Product documentation"))}</a></li>
						<li><a href="https://github.com/Microsoft/vscode">${escape(localize('welcomePage.gitHubRepository', "GitHub repository"))}</a></li>
						<li><a href="http://stackoverflow.com/questions/tagged/vscode?sort=votes&pageSize=50">${escape(localize('welcomePage.stackOverflow', "Stack Overflow"))}</a></li>
					</ul>
				</div>
				<p class="showOnStartup"><input type="checkbox" id="showOnStartup"> <label class="caption" for="showOnStartup">${escape(localize('welcomePage.showOnStartup', "Show welcome page on startup"))}</label></p>
			</div>
			<div class="commands">
				<div class="section createProject">
					<h2 class="caption">创建项目</h2>
					<ul>
						<li>项目类型：<select id='projectType' ><option value='AE'>AE</option><option value='SDK'>SDK</option></select></li>
						<li>项目名称：<input id='projectName' type='text' value=''/></li>
						<li>项目目录：<a href="javascript:void(0)" id='projectDir'>选择文件</a></li>
						<li><input type="checkbox" value='isDemoCode' /> 包含演示代码</li>
						<li><input type="checkbox" value='isSyncSdp'/> 项目同步 SDK 站点</li>
						<li><input type="checkbox" value='isInstallDepend'/> 同步安装项目依赖</li>
					</ul>
					<div><a href="javascript:void(0)" id='createProject'>创建</a></div>
				</div>
			</div>
		</div>
	</div>
</div>
`;
