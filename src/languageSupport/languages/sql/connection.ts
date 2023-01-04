import {ConnectionManager as AgnosticConnectionManager} from 'src/languageSupport/languages/agnostic/connection'

// Types
import {
  DEFAULT_SQL_EDITOR_TEXT,
  CompositionSelection,
} from 'src/dataExplorer/context/persistance'
import {
  SelectableDurationTimeRange,
  TagKeyValuePair,
  TimeRange,
} from 'src/types'

// Utils
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {notify} from 'src/shared/actions/notifications'
import {compositionEnded} from 'src/shared/copy/notifications'

const castType = (value, _typ = null) => {
  // DLW TODO -- determine type and cast
  return `'${value}'`
}

const groupedTagValues = (
  tagValues: TagKeyValuePair[]
): {[key: string]: string[]} =>
  tagValues.reduce(
    (acc, {key, value}) => ({
      ...acc,
      [key]: (acc[key] || []).concat([value]),
    }),
    {}
  )

export class ConnectionManager extends AgnosticConnectionManager {
  private _timeRange: SelectableDurationTimeRange = DEFAULT_TIME_RANGE

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

    const changeInBlock =
      change.range.startLineNumber >= startLine &&
      change.range.endLineNumber <= endLine

    const isDeletion = change.text == ''
    let deletionFromBlock = false
    if (isDeletion) {
      const linesDeleted =
        change.range.endLineNumber - change.range.startLineNumber
      deletionFromBlock =
        change.range.startLineNumber >= startLine &&
        change.range.endLineNumber <= endLine + linesDeleted
    }

    return changeInBlock || deletionFromBlock
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

    switch (
      `${this._session.fields.length > 0}|${this._session.tagValues.length > 0}`
    ) {
      case `true|true`:
        composition = composition.concat([
          'WHERE',
          this._timeRange.sql,
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
          this._timeRange.sql,
          'AND',
          `(${fieldsExpr})`,
        ])
        lines += 4
        break
      case `false|true`:
        composition = composition.concat([
          'WHERE',
          this._timeRange.sql,
          'AND',
          tagValuesExpr,
        ])
        lines += 4
        break
      default:
        composition = composition.concat(['WHERE', this._timeRange.sql])
        lines += 2
        break
    }
    return {
      composition: composition.join('\n'),
      lines,
      lenLastLine: composition[composition.length - 1].length,
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
    const addNewLine = startLineNumber == 1 && endLineNumber == 1
    const endColumn = addNewLine ? 1 : Infinity
    this._model.applyEdits([
      {
        text: `${composition}${addNewLine ? '\n' : ''}`,
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
      },
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

    // DLW TODO -- handle when is wrong timeRange type. Perhaps conditionally rendering in datePicker?
    const isAcceptedTimeRange = range.hasOwnProperty('label')
    if (!isAcceptedTimeRange) {
      return
    }
    const rangeChanged =
      this._timeRange.label != (range as SelectableDurationTimeRange).label
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
