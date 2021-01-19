// Libraries
import React, {FC, useCallback} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Actions
import {setViewProperties} from 'src/timeMachine/actions'

// Components
import {DapperScrollbars} from '@influxdata/clockface'

// Utils
import {getActiveTimeMachine, getVisTable} from 'src/timeMachine/selectors'
import {ViewOptions as Options} from 'src/visualization'

// Types
import {ViewProperties} from 'src/types'

const ViewOptions: FC = () => {
  const {view} = useSelector(getActiveTimeMachine)
  const results = useSelector(getVisTable)
  const dispatch = useDispatch()

  const update = useCallback(
    (properties: Partial<ViewProperties>) => {
      dispatch(
        setViewProperties({
          ...view.properties,
          ...properties,
        } as ViewProperties)
      )
    },
    [dispatch, view.properties]
  )

  return (
    <div className="view-options--wrap">
      <DapperScrollbars
        autoHide={false}
        style={{width: '100%', height: '100%'}}
      >
        <Options
          properties={view.properties}
          results={results}
          update={update}
        />
      </DapperScrollbars>
    </div>
  )
}

export default ViewOptions
