import React, {FC, useContext} from 'react'

import {PipeProp} from 'src/types/flows'
import {Icon, IconFont} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'

const Missing: FC<PipeProp> = ({Context}) => {
  const {data} = useContext(PipeContext)

  return (
    <Context>
      <div className="flow-error">
        <div className="flow-error--header">
          <Icon
            glyph={IconFont.AlertTriangle}
            className="flow-error--vis-toggle"
          />
        </div>
        <div className="flow-error--body">
          <h1>
            Missing definition for <span>{data.type}</span>
          </h1>
          <p>
            The UI doesn't know how to display this panel. Delete this panel to
            remove this message
          </p>
        </div>
      </div>
    </Context>
  )
}

export default Missing
