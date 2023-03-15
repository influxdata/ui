import {ConnectionManager as AgnosticConnectionManager} from 'src/languageSupport/languages/agnostic/connection'

// Types
import {LspRange} from 'src/languageSupport/languages/agnostic/types'
import {
  DEFAULT_SQL_EDITOR_TEXT,
  CompositionSelection,
} from 'src/dataExplorer/context/persistance'
import {SelectableDurationTimeRange, TimeRange} from 'src/types'

// Utils
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {rangeToInterval as buildTimeRange} from 'src/shared/utils/sqlInterval'
import {notify} from 'src/shared/actions/notifications'
import {compositionEnded} from 'src/shared/copy/notifications'
import {groupedTagValues} from 'src/languageSupport/languages/agnostic/utils'

const castType = (value, _typ = null) => {
  // Outstanding tech debt.
  // For the TagValue selector (Qx builder), flux composition, and rest of codebase.
  // It only supports tagValues of type string.
  return `'${value}'`
}

export class ConnectionManager extends AgnosticConnectionManager {
  private _timeRange: TimeRange = DEFAULT_TIME_RANGE

  _couldBeFromComposition(change) {
    return change.forceMoveMarkers == true
  }

  _editorChangeIsWithinComposition(change) {
    if (!this._compositionRange) {
      return
    }
    const {
      start: {line: startLine},
      end: {line: endLine},
    } = this._compositionRange

    const hasChangeInBlock =
      change.range.startLineNumber >= startLine &&
      change.range.endLineNumber <= endLine

    const isDeletion = change.text == ''
    let hasDeletionFromBlock = false
    if (isDeletion) {
      const linesDeleted =
        change.range.endLineNumber - change.range.startLineNumber
      hasDeletionFromBlock =
        change.range.startLineNumber >= startLine &&
        change.range.endLineNumber <= endLine + linesDeleted
    }

    return hasChangeInBlock || hasDeletionFromBlock
  }

  _setCompositionHandlers() {
    this._model.onDidChangeContent(e => {
      const shouldEndSync = e.changes.some(
        change =>
          this._editorChangeIsWithinComposition(change) &&
          !this._couldBeFromComposition(change)
      )
      if (shouldEndSync) {
        // use setTimeout to remove race condition
        // have changes propogation first to SqlEditorMonaco.onChange()
        setTimeout(() => {
          this._callbackSetSession({
            composition: {synced: false},
          })
          this._dispatcher(notify(compositionEnded()))
        }, 0)
      }
    })
  }

  _buildComposition(
    _toAdd: Partial<CompositionSelection>,
    _toRemove: Partial<CompositionSelection> = null
  ) {
    let composition = ['SELECT *']
    let lines = 1
    if (this._session.measurement) {
      composition.push(`FROM "${this._session.measurement}"`)
      lines++
    }

    const fieldsExpr = this._session.fields
      .map(f => `"${f}" IS NOT NULL`)
      .join(' OR ')
    const tagValuesExpr = Object.entries(
      groupedTagValues(this._session.tagValues)
    )
      .map(
        ([key, values]) =>
          `"${key}" IN (${values.map(v => castType(v)).join(',')})`
      )
      .join(' AND ')

    const timeRangeExpr = buildTimeRange(this._timeRange)

    switch (
      `${this._session.fields.length > 0}|${this._session.tagValues.length > 0}`
    ) {
      case `true|true`:
        composition = composition.concat([
          'WHERE',
          timeRangeExpr,
          'AND',
          `(${fieldsExpr})`,
          'AND',
          tagValuesExpr,
        ])
        lines += 6
        break
      case `true|false`:
        composition = composition.concat([
          'WHERE',
          timeRangeExpr,
          'AND',
          `(${fieldsExpr})`,
        ])
        lines += 4
        break
      case `false|true`:
        composition = composition.concat([
          'WHERE',
          timeRangeExpr,
          'AND',
          tagValuesExpr,
        ])
        lines += 4
        break
      default:
        composition = composition.concat(['WHERE', timeRangeExpr])
        lines += 2
        break
    }
    return {
      composition: composition.join('\n'),
      lines,
      lenLastLine: composition[composition.length - 1]?.length ?? 0,
    }
  }

  _updateComposition(
    toAdd: Partial<CompositionSelection>,
    toRemove: Partial<CompositionSelection>
  ) {
    const {composition, lines, lenLastLine} = this._buildComposition(
      toAdd,
      toRemove
    )

    // replacement Range
    const startLineNumber = this._compositionRange?.start?.line ?? 1
    const endLineNumber = this._compositionRange?.end?.line ?? 1
    const shouldAddNewLine = startLineNumber == 1 && endLineNumber == 1
    const endColumn = shouldAddNewLine ? 1 : Infinity
    this._model.applyEdits([
      {
        text: `${composition}${shouldAddNewLine ? '\n' : ''}`,
        forceMoveMarkers: true,
        range: {
          startLineNumber,
          startColumn: 1,
          endLineNumber,
          endColumn,
        },
      },
    ])

    // updated composition's new Range
    this._setEditorBlockStyle(
      {
        start: {line: startLineNumber, column: 1},
        end: {line: startLineNumber + lines - 1, column: lenLastLine},
      } as LspRange,
      lines > 0 ? true : false
    )
  }

  onSchemaSessionChange(
    schema: CompositionSelection,
    sessionCb,
    dispatch,
    range: TimeRange
  ) {
    const {shouldContinue, previousState} = this._updateLocalState(
      schema,
      sessionCb,
      dispatch
    )
    if (!shouldContinue) {
      return
    }

    const {toAdd, toRemove, shouldRemoveDefaultMsg} = this._diffSchemaChange(
      schema,
      previousState,
      DEFAULT_SQL_EDITOR_TEXT
    )

    if (this._first_load) {
      this._first_load = false
      this._setCompositionHandlers()
    }
    if (shouldRemoveDefaultMsg) {
      this._model.setValue('')
    }

    const rangeChanged =
      this._timeRange?.lower != range.lower ||
      this._timeRange?.upper != range.upper

    this._timeRange = range as SelectableDurationTimeRange

    if (
      Object.keys(toAdd).length ||
      Object.keys(toRemove).length ||
      rangeChanged
    ) {
      this._updateComposition(toAdd, toRemove)
    }
  }
}
