/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import URI from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';

export const IFileServiceExtra = createDecorator<IFileServiceExtra>('fileServiceExtra');

export interface IFileServiceExtra extends IFileService {
	copyDir(src: URI, dest: URI): TPromise;
}

