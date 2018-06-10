
'use strict';

import { Range } from 'vs/editor/common/core/range';
import { IIdentifiedSingleEditOperation } from 'vs/editor/common/model';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { TextEdit } from 'vs/editor/common/modes';


export class ValueEditOperation extends EditOperation {
	// TODO: 抽出 JSX 的位置计算，要考虑同行的影响
	public static textReplace(event: TextEdit): Array<IIdentifiedSingleEditOperation> {
		return [event].map(edit => EditOperation.replace(Range.lift(edit.range), edit.text));
	}

}
