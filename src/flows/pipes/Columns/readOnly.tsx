// Libraries
import React, {FC, useContext} from 'react'
import {Icon, IconFont, SlideToggle} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'

// Types
import {PipeProp} from 'src/types/flows'
import {Hash, Mapping} from 'src/flows/pipes/Columns'

// Contexts
import {PipeContext} from 'src/flows/context/pipe'

// Constants
import {UNPROCESSED_PANEL_TEXT} from 'src/flows/constants'

// Styles
import './styles.scss'

const Columns: FC<PipeProp> = ({Context}) => {
  const {data, loading, results} = useContext(PipeContext)

  if (!results.parsed || !results.parsed.table) {
    let msg = UNPROCESSED_PANEL_TEXT

    if (loading === RemoteDataState.Loading) {
      msg = 'Loading'
    }

    return (
      <Context>
        <div className="panel-resizer">
          <div className="panel-resizer--header">
            <Icon
              glyph={IconFont.Layers}
              className="panel-resizer--vis-toggle"
            />
          </div>
          <div className="panel-resizer--body">
            <div className="panel-resizer--empty">{msg}</div>
          </div>
        </div>
      </Context>
    )
  }

  const columns: Hash<Mapping> = Object.entries(data.mappings || {}).reduce(
    (acc, [k, v]) => {
      if (acc[k]) {
        acc[k] = v
      }

      return acc
    },
    Object.keys(results.parsed.table.columns).reduce((acc, curr) => {
      acc[curr] = {name: curr, visible: true}
      return acc
    }, {})
  )

  const cards = Object.entries(columns).map(([k, v]) => {
    return (
      <div className="flow-columns--column" key={k}>
        <SlideToggle
          className="flow-columns--toggle"
          onChange={() => {}}
          active={v.visible}
          disabled={true}
        />
        <p className="flow-columns--text">{v.name ?? 'Column Name'}</p>
      </div>
    )
  })

  return (
    <Context>
      <div className="flow-columns">{cards}</div>
    </Context>
  )
}

export default Columns
