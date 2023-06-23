import * as MonacoTypes from 'monaco-editor/esm/vs/editor/editor.api'
import {ConnectionManager as AgnosticConnectionManager} from 'src/languageSupport/languages/agnostic/connection'

// Types
import {
  CompositionSelection,
  DEFAULT_INFLUXQL_EDITOR_TEXT,
} from 'src/dataExplorer/context/persistence'
import {
  RecursivePartial,
  SelectableDurationTimeRange,
  TimeRange,
} from 'src/types'
import {LspRange} from 'src/languageSupport/languages/agnostic/types'

// Utils
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {rangeToInfluxQLInterval as buildTimeRange} from 'src/shared/utils/rangeToInterval'
import {notify} from 'src/shared/actions/notifications'
import {compositionEnded} from 'src/shared/copy/notifications'
import {
  groupedTagValues,
  getTagKeys,
} from 'src/languageSupport/languages/agnostic/utils'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export class ConnectionManager extends AgnosticConnectionManager {
  private _timeRange: TimeRange = DEFAULT_TIME_RANGE

  _buildComposition = (): {
    composition: string
    lines: number
    lenLastLine: number
  } => {
    let lines: number = 1

    const tagKeys = getTagKeys(this._session.tagValues)
    const selectedFieldAndTagKeys = [...this._session.fields, ...tagKeys].sort()
    const selectStatement = selectedFieldAndTagKeys
      .map(k => `"${k}"`)
      .join(', ')
    let composition = [
      `SELECT ${selectedFieldAndTagKeys.length === 0 ? '*' : selectStatement}`,
    ]

    const dbrpMeasurement: string[] = []
    if (this._session.dbrp) {
      dbrpMeasurement.push(
        `"${this._session.dbrp.database}"`,
        `"${this._session.dbrp.retention_policy}"`
      )
    }
    if (this._session.measurement) {
      dbrpMeasurement.push(`"${this._session.measurement}"`)
    }
    if (dbrpMeasurement.length > 0) {
      composition.push(`FROM ${dbrpMeasurement.join('.')}`)
      lines++
    }

    const tagValuesExpr = Object.entries(
      groupedTagValues(this._session.tagValues)
    )
      .map(([key, values]) =>
        values.map((value: string) => `"${key}" = '${value}'`).join(' OR ')
      )
      .join(' AND ')

    const timeRangeExpr = buildTimeRange(this._timeRange)

    let whereClause: string[] = []

    if (this._session.tagValues.length > 0) {
      whereClause = ['WHERE', timeRangeExpr, 'AND', `(${tagValuesExpr})`]
    } else {
      whereClause = ['WHERE', timeRangeExpr]
    }

    composition = composition.concat(whereClause)
    lines += whereClause.length
    return {
      composition: composition.join('\n'),
      lines,
      lenLastLine: composition.slice(-1).length,
    }
  }

  _updateComposition = (): void => {
    const {composition, lines, lenLastLine} = this._buildComposition()

    // replace composition range
    const startLineNumber: number = this._compositionRange?.start?.line ?? 1
    const endLineNumber: number = this._compositionRange?.end?.line ?? 1
    const shouldAddNewLine = startLineNumber === 1 && endLineNumber === 1
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
      } as MonacoTypes.editor.IIdentifiedSingleEditOperation,
    ])

    // update composition's new range style
    this._setEditorBlockStyle(
      {
        start: {line: startLineNumber, column: 1},
        end: {line: startLineNumber + lines - 1, column: lenLastLine},
      } as LspRange,
      lines > 0
    )
  }

  _editorChangeIsWithinComposition = (
    change: MonacoTypes.editor.IModelContentChange
  ): boolean => {
    if (!this._compositionRange) {
      return false
    }
    const {
      start: {line: startLine},
      end: {line: endLine},
    } = this._compositionRange

    const hasChangeInBlock =
      change.range.startLineNumber >= startLine &&
      change.range.endLineNumber <= endLine

    const isDeletion = change.text === ''
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

  _couldBeFromComposition = (change: any): boolean => {
    // There are three types of change that are from composition
    //  1. starting a new script
    //  2. removing the DEFAULT_INFLUXQL_EDITOR_TEXT, i.e. selecting a bucket on a new script,
    //     which happens in the onSchemaSessionChange() if statement shouldRemoveDefaultMsg
    //  3. setting forceMoveMarkers to true manually in _updateComposition()
    return (
      change.text === DEFAULT_INFLUXQL_EDITOR_TEXT ||
      change.rangeLength === DEFAULT_INFLUXQL_EDITOR_TEXT.length ||
      change.forceMoveMarkers
    )
  }

  _setCompositionHandlers = (): void => {
    this._model.onDidChangeContent(e => {
      const shouldEndSync = e.changes.some(
        (change: MonacoTypes.editor.IModelContentChange) =>
          this._editorChangeIsWithinComposition(change) &&
          !this._couldBeFromComposition(change)
      )
      if (shouldEndSync) {
        // use setTimeout to remove race condition
        // have changes propogation first to InfluxQLEditorMonaco.onChange()
        setTimeout(() => {
          this._callbackSetSession({
            composition: {synced: false},
          })
          this._dispatcher(notify(compositionEnded()))
        }, 0)
      }
    })
  }

  onSchemaSessionChange = (
    schema: CompositionSelection,
    sessionCb: (schema: RecursivePartial<CompositionSelection>) => void, // callback fn
    dispatch: (_: any) => void,
    range: TimeRange
  ) => {
    const {shouldContinue, previousState} = this._updateLocalState(
      schema,
      sessionCb,
      dispatch
    )
    if (!shouldContinue || !isFlagEnabled('schemaComposition')) {
      return
    }

    const {toAdd, toRemove, shouldRemoveDefaultMsg} = this._diffSchemaChange(
      schema,
      previousState,
      DEFAULT_INFLUXQL_EDITOR_TEXT
    )

    if (this._first_load) {
      this._first_load = false
      this._setCompositionHandlers()
    }

    if (shouldRemoveDefaultMsg) {
      this._model.setValue('')
    }

    const rangeChanged =
      this._timeRange?.lower !== range?.lower ||
      this._timeRange?.upper !== range?.upper

    this._timeRange = range as SelectableDurationTimeRange

    if (
      Object.keys(toAdd).length ||
      Object.keys(toRemove).length ||
      rangeChanged
    ) {
      this._updateComposition()
    }
  }
}
