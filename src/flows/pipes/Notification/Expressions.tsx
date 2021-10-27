import React, {FC, useState, useMemo, useCallback} from 'react'

import {
  Input,
  InputType,
  IconFont,
  EmptyState,
  ComponentSize,
} from '@influxdata/clockface'
import {FromFluxResult} from '@influxdata/giraffe'
import Expression from 'src/flows/pipes/Notification/Expression'

interface Props {
  parsed: FromFluxResult
  onSelect: (exp: string) => void
}

interface SchemaExpressions {
  [key: string]: Array<string>
}

const parsedResultToSchema = (
  parsed: FromFluxResult,
  search: string
): SchemaExpressions => {
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
  const fields = out.columns._field?.data
  const columns = out.columnKeys.filter(key => {
    return filtered.reduce((acc, curr) => {
      return acc && !curr.test(key)
    }, true)
  })
  const columnsToInclude = ['_start', '_stop', '_measurement']
  const systemVars = [
    '_check_id',
    '_check_name',
    '_level',
    '_notebook_link',
    '_source_measurement',
    '_type',
  ]
  const schema = {
    fields: new Set<string>(
      fields?.filter(f => f.toLowerCase().includes(search.toLowerCase()))
    ),
    tags: new Set<string>(
      columns?.filter(
        c =>
          out.columns[c].data.filter(d => d) &&
          c.toLowerCase().includes(search.toLowerCase())
      )
    ),
    columns: out.columnKeys?.filter(
      c =>
        columnsToInclude.includes(c) &&
        c.toLowerCase().includes(search.toLowerCase())
    ),
    system: systemVars.filter(s =>
      s.toLowerCase().includes(search.toLowerCase())
    ),
  }

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

const Expressions: FC<Props> = ({parsed, onSelect}) => {
  const [search, setSearch] = useState('')
  const updateSearch = useCallback(
    e => {
      setSearch(e.target.value)
    },
    [search, setSearch]
  )

  const schemaExpressions = useMemo(
    () => parsedResultToSchema(parsed, search),
    [parsed, search]
  )

  let expComponent

  if (!Object.keys(schemaExpressions).length) {
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
                  onClickFunction={onSelect}
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
          icon={IconFont.Search_New}
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
