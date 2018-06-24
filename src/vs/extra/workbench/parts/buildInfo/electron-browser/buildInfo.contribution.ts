/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/buildInfo.contribution';
import { Registry } from 'vs/platform/registry/common/platform';
import { ViewletRegistry, Extensions as ViewletExtensions, ViewletDescriptor } from 'vs/workbench/browser/viewlet';
import { BuildInfoView, VIEW_ID } from 'vs/extra/workbench/parts/buildInfo/browser/buildInfoView';

// Register View in Viewlet and Panel area
Registry.as<ViewletRegistry>(ViewletExtensions.Viewlets).registerViewlet(new ViewletDescriptor(
	BuildInfoView,
	VIEW_ID,
	'构建信息',
	'buildInfo',
	10
));
