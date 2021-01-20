import React, {FC, useState, useCallback, ChangeEvent} from 'react'

import {
    Input,
    InputType,
    IconFont,
    DapperScrollbars,
    EmptyState,
    ComponentSize
} from '@influxdata/clockface'
import {FLUX_FUNCTIONS} from 'src/shared/constants/fluxFunctions'
import Fn from './function'

const Functions: FC = ({
    onSelect
}) => {
    const [search, setSearch] = useState('')
    const updateSearch = useCallback((e: ChangeEvent) => {
        setSearch(e.target.value)
    }, [search, setSearch])

    const filteredFunctions = FLUX_FUNCTIONS.filter(fn => {
        return search.length && fn.name.toLowerCase().includes(search.toLowerCase())
    })

    let fnComponent

    if (!filteredFunctions.length) {
        fnComponent = (
      <EmptyState size={ComponentSize.ExtraSmall}>
        <EmptyState.Text>No functions match your search</EmptyState.Text>
      </EmptyState>
        )
    } else {
        fnComponent = Object.entries(filteredFunctions.reduce((acc, fn) => {
            if (!acc[fn.category]) {
                acc[fn.category] = []
            }

            acc[fn.category].push(fn)

            return acc
        }, {}))
            .map(([category, fns]) => (
    <dl className="flux-toolbar--category"
        key={category}>
      <dt className="flux-toolbar--heading">{category}</dt>
      {fns.map(fn => (
        <Fn
          onClickFunction={onSelect}
          key={`${fn.name}_${fn.desc}`}
          func={fn}
          testID={fn.name}
        />
      ))}
    </dl>
            ))
    }

    return (
    <div className="flux-toolbar">
      <div className="flux-toolbar--search">
        <Input
          type={InputType.Text}
          icon={IconFont.Search}
          placeholder={`Filter Functions...`}
          onChange={updateSearch}
          value={search}
          testID="flux-toolbar-search--input"
        />
      </div>
      <DapperScrollbars className="flux-toolbar--scroll-area">
        <div className="flux-toolbar--list" data-testid="flux-toolbar--list">
            {fnComponent}
        </div>
      </DapperScrollbars>
    </div>
    )
}

export default Functions
