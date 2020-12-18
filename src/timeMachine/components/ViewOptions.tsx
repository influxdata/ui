// Libraries
import React, {FC, useMemo, useCallback, createElement} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Actions
import {setViewProperties} from 'src/timeMachine/actions'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Utils
import {getActiveTimeMachine, getVisTable} from 'src/timeMachine/selectors'
import {TYPE_DEFINITIONS} from 'src/visualization'

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

  const options = useMemo(() => {
    if (!TYPE_DEFINITIONS[view.properties.type].options) {
      return null
    }

    return (
      <ErrorBoundary>
        <div className="view-options--container">
          {createElement(TYPE_DEFINITIONS[view.properties.type].options, {
            properties: view.properties,
            results,
            update: update,
          })}
        </div>
      </ErrorBoundary>
    )
  }, [view.properties, results, update])

  return (
    <div className="view-options">
      <DapperScrollbars
        autoHide={false}
        style={{width: '100%', height: '100%'}}
      >
        {options}
      </DapperScrollbars>
    </div>
  )
}

export default ViewOptions
