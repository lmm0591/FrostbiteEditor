/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/simulation.contribution';
import { Registry } from 'vs/platform/registry/common/platform';
import { ViewletRegistry, Extensions as ViewletExtensions, ViewletDescriptor } from 'vs/workbench/browser/viewlet';
import { SimulationView, VIEW_ID } from 'vs/extra/workbench/parts/simulation/browser/simulationView';

Registry.as<ViewletRegistry>(ViewletExtensions.Viewlets).registerViewlet(new ViewletDescriptor(
	SimulationView,
	VIEW_ID,
	'模拟器',
	'simulation',
	91
));