/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import uri from 'vs/base/common/uri';
import { FileService } from 'vs/workbench/services/files/electron-browser/fileService';
import { IFileServiceExtra } from 'vs/extra/platform/files/common/files';
import { copy } from 'fs-extra';

export class FileServiceExtra extends FileService implements IFileServiceExtra {

	public copyDir (src: uri, dest: uri) {
		return copy(src.fsPath, dest.fsPath);
	}
}
