import React, {FC, useState, useMemo, useCallback, useContext} from 'react'

import {
  Input,
  InputType,
  IconFont,
  EmptyState,
  ComponentSize,
} from '@influxdata/clockface'
import {FromFluxResult} from '@influxdata/giraffe'
import Expression from 'src/flows/pipes/Notification/Expression'
import {FlowContext} from 'src/flows/context/flow.current'

interface Props {
  parsed: FromFluxResult
  id: string
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

  const parsedResultToSchema = (parsed: FromFluxResult): SchemaExpressions => {
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
    const schema = {
      measurements: new Set<string>(),
      fields: new Set<string>(),
      tags: new Set<string>(),
      columns: [],
      system: [],
    }

    for (ni = 0; ni < len; ni++) {
      if (measurements[ni].toLowerCase().includes(search.toLowerCase())) {
        schema.measurements.add(measurements[ni])
      }

      if (fields[ni].toLowerCase().includes(search.toLowerCase())) {
        schema.fields.add(fields[ni])
      }

      columns
        .filter(
          c =>
            !!out.columns[c].data[ni] &&
            c.toLowerCase().includes(search.toLowerCase())
        )
        .forEach(schema?.tags.add, schema.tags)
    }

    const otherColumns = ['_start', '_stop', '_measurement']
    schema.columns = out.columnKeys.filter(
      c =>
        otherColumns.includes(c) &&
        c.toLowerCase().includes(search.toLowerCase())
    )

    schema.system = [
      '_check_id',
      '_check_name',
      '_level',
      '_source_measurement',
      '_type',
    ].filter(s => s.toLowerCase().includes(search.toLowerCase()))

    const ret = {}
    Object.keys(schema).forEach(k => {
      if (schema[k].length || schema[k].size) {
        ret[k] = Array.from(schema[k])
      }
    })
    return ret
  }

  const capitalizeFirstLetter = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  const categoriesCompare = (a: string, b: string) => {
    const order = ['measurements', 'fields', 'tags', 'columns', 'system']
    return order.indexOf(a) - order.indexOf(b)
  }

  const isExpressionsEmpty = (schemaExpressions: SchemaExpressions) => {
    let isEmptySchemas = 0
    Object.keys(schemaExpressions).forEach(k => {
      if (!schemaExpressions[k].length) {
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
        ` r.${exp} `,
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
    expComponent = (
      <>
        {Object.keys(schemaExpressions)
          .sort((a, b) => categoriesCompare(a, b))
          .map(category => (
            <dl className="flux-toolbar--category" key={category}>
              <dt className="flux-toolbar--heading">
                {capitalizeFirstLetter(category)}
              </dt>
              {schemaExpressions[category].map(exp => (
                <Expression
                  onClickFunction={inject}
                  key={`${category}-${exp}`}
                  testID={`${category}-${exp}`}
                  expression={exp}
                />
              ))}
            </dl>
          ))}
      </>
    )
  }

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
      <div className="flux-toolbar--list" data-testid="flux-toolbar--list">
        {expComponent}
      </div>
    </div>
  )
}

export default Expressions
