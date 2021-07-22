import React, {FC, useContext, useEffect, useState} from 'react'
import {PipeContext} from 'src/flows/context/pipe'
import './styles.scss'
import {PipeProp} from 'src/types/flows'
import {
  Icon,
  IconFont,
  ResourceCard,
  SlideToggle,
  FlexBox,
  FlexDirection,
  AlignItems,
  ComponentSize,
} from '@influxdata/clockface'

export interface TableColumnKey {
  name: string
  visible: boolean
}

const View: FC<PipeProp> = ({Context}) => {
  const {update, data, results} = useContext(PipeContext)

  const updateColumn = (key, val) => {
    if ((data.mappings || {})[key] && val.name === key && val.visible === true) {
      delete data.mappings[key]
      update({
        mappings: {...data.mappings}
      })
      return
    }

    if ((data.mappings || {})[key] && data.mappings[key].name === val.name && data.mappings[key].visible === val.visible) {
      return
    }

    if (!data.mappings) {
      data.mappings = {}
    }

    data.mappings[key] = val
    update({
      mappings: {...data.mappings}
    })
  }

  if (!results.parsed || !results.parsed.table) {
    return (
      <Context>
        <div className="panel-resizer">
          <div className="panel-resizer--header">
            <Icon glyph={IconFont.Layers} className="panel-resizer--vis-toggle"/>
          </div>
          <div className="panel-resizer--body">
            <div className="panel-resizer--empty">This cell will display columns from the previous cell</div>
          </div>
        </div>
      </Context>
    )
  }

  const columns = Object.entries(data.mappings || {}).reduce((acc, [k, v]) => {
    if (acc[k]) {
      acc[k] = v
    }

    return acc
  }, Object.keys(results.parsed.table.columns).reduce((acc, curr) => {
    acc[curr] = { name: curr, visible: true }
    return acc
  }, {}))

  const cards = Object.entries(columns).map(([k, v]) => {
    const updateVisibility = () => {
      updateColumn(k, {
        ...v,
        visible: !v.visible
      })
    }
    const updateName = (evt) => {
      updateColumn(k, {
        ...v,
        name: evt.target.value
      })
    }

    return (
      <div className="flow-columns--column" key={k}>
        <SlideToggle
          className="flow-columns--toggle"
          onChange={updateVisibility}
          active={v.visible}
        />
        <div className="flow-columns--input">
          <input
            type="text"
            value={v.name}
            onChange={updateName}
            placeholder="Column Name"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <Icon glyph={IconFont.Pencil} className="flow-panel--title-icon" />
        </div>
      </div>
    )
  })

  return (
    <Context>
      <div className="columns-panel--grid">
        {cards}
      </div>
    </Context>
  )
}
export default View
