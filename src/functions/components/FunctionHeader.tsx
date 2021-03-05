// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {Page, Button, ComponentColor} from '@influxdata/clockface'
import {FunctionListContext} from 'src/functions/context/function.list'

// Utils
import {getOrg} from 'src/organizations/selectors'

const FunctionHeader: FC = () => {
  const history = useHistory()
  const {id: orgID} = useSelector(getOrg)

  const {
    draftFunction: {name},
    saveDraftFunction,
  } = useContext(FunctionListContext)

  const cancelFunction = () => {
    history.push(`/orgs/${orgID}/functions/`)
    // TODO dont allow routing away if unsaved changes exist
  }

  return (
    <>
      <Page.Header fullWidth={false} testID="functions-edit-page--header">
        <Page.Title title={name} />
      </Page.Header>
      <Page.ControlBar fullWidth={true}>
        <Page.ControlBarRight>
          <Button
            color={ComponentColor.Default}
            text="Cancel"
            onClick={cancelFunction}
            testID="function-cancel-btn"
          />
          <Button
            color={ComponentColor.Success}
            text="Save"
            onClick={saveDraftFunction}
            testID="function-save-btn"
          />
        </Page.ControlBarRight>
      </Page.ControlBar>
    </>
  )
}

export default FunctionHeader
