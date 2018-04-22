
'use strict';

import { Range } from 'vs/editor/common/core/range';
import { IIdentifiedSingleEditOperation } from 'vs/editor/common/model';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { TextEdit } from 'vs/editor/common/modes';
import { ValueChangeEvent } from 'vs/extra/contrib/infoPlane/infoPlaneWidget';


export class ValueEditOperation extends EditOperation {

	public static textReplace(event: ValueChangeEvent): Array<IIdentifiedSingleEditOperation> {
		let textEdit: TextEdit = {
			text: event.value,
			range: {
				endColumn: event.valueRange.end.column + 1,
				endLineNumber: event.valueRange.end.line,
				startColumn: event.valueRange.start.column + 1,
				startLineNumber: event.valueRange.start.line
			}
		};
		return [textEdit].map(edit => EditOperation.replace(Range.lift(edit.range), edit.text));
	}

}
