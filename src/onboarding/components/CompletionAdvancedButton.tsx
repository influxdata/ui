// Libraries
import React, {FC, memo} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {Button, ComponentColor, ComponentSize} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Types
import {AppState} from 'src/types'

interface Props {
  onExit: () => void
}

const CompletionAdvancedButton: FC<Props> = ({onExit}) => {
  const orgID = useSelector((state: AppState) => state.onboarding.orgID)
  const history = useHistory()

  const handleAdvanced = (): void => {
    if (orgID) {
      history.push(`/orgs/${orgID}/load-data/buckets`)
    } else {
      onExit()
    }
  }
  return (
    <ErrorBoundary>
      <Button
        text="Advanced"
        color={ComponentColor.Success}
        size={ComponentSize.Large}
        onClick={handleAdvanced}
        testID="button--advanced"
      />
    </ErrorBoundary>
  )
}

export default memo(CompletionAdvancedButton)
