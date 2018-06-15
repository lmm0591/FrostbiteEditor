/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Builder } from 'vs/base/browser/builder';

export const IComponentPartService = createDecorator<IComponentPartService>('componentPartService');

export interface IComponentPartService {
	getContainer(): Builder;
}
