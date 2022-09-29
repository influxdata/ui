// Libraries
import React, {FC, memo} from 'react'
import {useHistory} from 'react-router-dom'
import {get} from 'lodash'

// Components
import {Button, ComponentColor, ComponentSize} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Types
import {Dashboard} from 'src/types'

interface Props {
  dashboards: Dashboard[]
  onExit: () => void
}

const CompletionQuickStartButton: FC<Props> = ({onExit, dashboards}) => {
  const history = useHistory()
  const handleAdvanced = (): void => {
    const id = get(dashboards, '[0].id', null)
    if (id) {
      history.push(`/dashboards/${id}`)
    } else {
      onExit()
    }
  }
  return (
    <ErrorBoundary>
      <Button
        text="Quick Start"
        color={ComponentColor.Success}
        size={ComponentSize.Large}
        onClick={handleAdvanced}
        testID="button--quick-start"
      />
    </ErrorBoundary>
  )
}

export default memo(CompletionQuickStartButton)
