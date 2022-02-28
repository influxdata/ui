// Libraries
import React, {FC, useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {
  Button,
  ConfirmationButton,
  Appearance,
  ComponentColor,
} from '@influxdata/clockface'

// Actions
import {
  editActiveQueryWithBuilder,
  editActiveQueryAsFlux,
  resetActiveQuerySwitchToBuilder,
} from 'src/timeMachine/actions'

// Utils
import {getActiveQuery} from 'src/timeMachine/selectors'
import {
  confirmationState,
  ConfirmationState,
} from 'src/timeMachine/utils/queryBuilder'
import {event} from 'src/cloud/utils/reporting'

const TimeMachineQueriesSwitcher: FC = () => {
  const dispatch = useDispatch()
  const activeQuery = useSelector(getActiveQuery)
  const {editMode, text, builderConfig} = activeQuery
  const scriptMode = editMode !== 'builder'

  const handleEditAsFlux = useCallback(() => {
    event('Switched to Script Editor')
    dispatch(editActiveQueryAsFlux())
  }, [dispatch])

  let button = (
    <Button
      text="Script Editor"
      titleText="Switch to Script Editor"
      onClick={handleEditAsFlux}
      testID="switch-to-script-editor"
    />
  )

  const handleEditWithBuilder = useCallback(() => {
    event('Switch to Query Builder Clicked')
    dispatch(editActiveQueryWithBuilder())
  }, [dispatch])

  if (scriptMode) {
    button = (
      <Button
        text="Query Builder"
        titleText="Switch to Query Builder"
        onClick={handleEditWithBuilder}
        testID="switch-to-query-builder"
      />
    )
  }

  const handleResetAndEditWithBuilder = useCallback(() => {
    event('Confirmed switch to Query Builder Clicked')
    dispatch(resetActiveQuerySwitchToBuilder())
  }, [dispatch])

  if (
    scriptMode &&
    confirmationState(text, builderConfig) === ConfirmationState.Required
  ) {
    button = (
      <ConfirmationButton
        popoverColor={ComponentColor.Danger}
        popoverAppearance={Appearance.Outline}
        popoverStyle={{width: '400px'}}
        confirmationLabel="Switching to Query Builder mode will discard any changes you
                have made using Flux. This cannot be recovered."
        confirmationButtonText="Switch to Builder"
        text="Query Builder"
        onConfirm={handleResetAndEditWithBuilder}
        testID="switch-query-builder-confirm"
      />
    )
  }

  return button
}

export default TimeMachineQueriesSwitcher
