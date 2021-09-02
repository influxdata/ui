import React, {FC, useState, useMemo, useCallback, useContext} from 'react'

import {
  Input,
  InputType,
  IconFont,
  DapperScrollbars,
  EmptyState,
  ComponentSize,
} from '@influxdata/clockface'
import {FromFluxResult} from '@influxdata/giraffe'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import Expression from 'src/flows/pipes/Notification/Expression'
import {FlowContext} from 'src/flows/context/flow.current'

interface Props {
  parsed: FromFluxResult
  id: string
}

interface Schemas {
  [key: string]: SchemaExpressions
}

interface SchemaExpressions {
  [key: string]: Array<string>
}

const Expressions: FC<Props> = ({id, parsed}) => {
  const [search, setSearch] = useState('')
  const {flow, updateData} = useContext(FlowContext)
  const updateSearch = useCallback(
    e => {
      setSearch(e.target.value)
    },
    [search, setSearch]
  )

  const parsedResultToSchema = (parsed: FromFluxResult): Schemas => {
    let ni
    const filtered = [
      /^_start$/,
      /^_stop$/,
      /^_time$/,
      /^_value/,
      /^_measurement$/,
      /^_field$/,
      /^table$/,
      /^result$/,
    ]
    if (!parsed) {
      return
    }

    const out = parsed.table as any
    const len = out.length
    const measurements = out.columns._measurement?.data
    const fields = out.columns._field?.data
    const columns = out.columnKeys.filter(key => {
      return filtered.reduce((acc, curr) => {
        return acc && !curr.test(key)
      }, true)
    })
    const schema = {} as any

    for (ni = 0; ni < len; ni++) {
      if (!schema.hasOwnProperty(measurements[ni])) {
        schema[measurements[ni]] = {}
      }

      // TODO: is there always only one field?
      const filteredFields = [fields[ni]].filter(f =>
        f.toLowerCase().includes(search.toLowerCase())
      )
      if (filteredFields.length) {
        schema[measurements[ni]].fields = filteredFields
      }

      const filteredMeasurements = [
        ...new Set<string>(measurements),
      ].filter(m => m.toLowerCase().includes(search.toLowerCase()))
      if (filteredMeasurements.length) {
        schema[measurements[ni]].measurements = filteredMeasurements
      }

      const filteredSystems = [
        '_check_id',
        '_check_name',
        '_level',
        '_source_measurement',
        '_type',
      ].filter(s => s.toLowerCase().includes(search.toLowerCase()))
      if (filteredSystems.length) {
        schema[measurements[ni]].system = filteredSystems
      }

      const filteredTags = columns.filter(
        c =>
          !!out.columns[c].data[ni] &&
          c.toLowerCase().includes(search.toLowerCase())
      )
      if (filteredTags.length) {
        schema[measurements[ni]].tags = filteredTags
      }

      const otherColumns = ['_start', '_stop', '_measurement']
      const filteredOtherColumns = out.columnKeys.filter(
        c =>
          otherColumns.includes(c) &&
          c.toLowerCase().includes(search.toLowerCase())
      )
      if (filteredOtherColumns.length) {
        schema[measurements[ni]].columns = filteredOtherColumns
      }
    }

    return schema
  }

  const capitalizeFirstLetter = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  const categoriesCompare = (a: string, b: string) => {
    const order = ['measurements', 'fields', 'tags', 'columns', 'system']
    return order.indexOf(a) - order.indexOf(b)
  }

  const isExpressionsEmpty = (schemaExpressions: Schemas) => {
    if (!Object.keys(schemaExpressions).length) {
      return true
    }
    let isEmptySchemas = 0
    Object.values(schemaExpressions).forEach(s => {
      if (!Object.keys(s).length) {
        isEmptySchemas += 1
      }
    })
    return Object.keys(schemaExpressions).length === isEmptySchemas
  }

  const inject = (exp: string): void => {
    const data = flow.data.byID[id]
    updateData(id, {
      ...data,
      message: [
        data.message.slice(0, data.cursorPosition),
        ` r.${exp}`,
        data.message.slice(data.cursorPosition),
      ].join(''),
    })
  }

  const schemaExpressions = useMemo(() => parsedResultToSchema(parsed), [
    parsed,
    search,
  ])

  let expComponent

  if (isExpressionsEmpty(schemaExpressions)) {
    expComponent = (
      <EmptyState size={ComponentSize.ExtraSmall}>
        <EmptyState.Text>No expressions match your search</EmptyState.Text>
      </EmptyState>
    )
  } else {
    expComponent = Object.entries(schemaExpressions).map(([table, schema]) => (
      <div key={`table-${table}`}>
        {Object.keys(schema)
          .sort((a, b) => categoriesCompare(a, b))
          .map(category => (
            <dl className="flux-toolbar--category" key={`${table}-${category}`}>
              <dt className="flux-toolbar--heading">
                {capitalizeFirstLetter(category)}
              </dt>
              {schema[category].map(exp => (
                <Expression
                  onClickFunction={inject}
                  key={`${table}-${category}-${exp}`}
                  testID={`${table}-${category}-${exp}`}
                  expression={exp}
                />
              ))}
            </dl>
          ))}
      </div>
    ))
  }

  const body = isFlagEnabled('flowSidebar') ? (
    <div className="flux-toolbar--list" data-testid="flux-toolbar--list">
      {expComponent}
    </div>
  ) : (
    <DapperScrollbars className="flux-toolbar--scroll-area">
      <div className="flux-toolbar--list" data-testid="flux-toolbar--list">
        {expComponent}
      </div>
    </DapperScrollbars>
  )

  return (
    <div className="flux-toolbar">
      <div className="flux-toolbar--search">
        <Input
          type={InputType.Text}
          icon={IconFont.Search}
          placeholder="Filter Expressions..."
          onChange={updateSearch}
          value={search}
          testID="flux-toolbar-search--input"
        />
      </div>
      {body}
    </div>
  )
}

export default Expressions
