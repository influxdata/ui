import React, {FC, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

// Components
import ImportOverlay from 'src/shared/components/ImportOverlay'

// Copy
import {invalidJSON} from 'src/shared/copy/notifications'

// Actions
import {createVariableFromTemplate} from 'src/variables/actions/thunks'
import {notify} from 'src/shared/actions/notifications'

// Types
import {ComponentStatus} from '@influxdata/clockface'

// Utils
import jsonlint from 'jsonlint-mod'

const VariableImportOverlay: FC = () => {
  const dispatch = useDispatch()
  const [status, setStatus] = useState(ComponentStatus.Default)
  const history = useHistory()

  const onDismiss = () => {
    history.goBack()
  }

  const updateOverlayStatus = (overlayStatus: ComponentStatus) => {
    setStatus(overlayStatus)
  }

  const handleImportVariable = (uploadContent: string) => {
    let template
    updateOverlayStatus(ComponentStatus.Default)
    try {
      template = jsonlint.parse(uploadContent)
    } catch (error) {
      updateOverlayStatus(ComponentStatus.Error)
      dispatch(notify(invalidJSON(error.message)))
      return
    }

    dispatch(createVariableFromTemplate(template))

    onDismiss()
  }

  return (
    <ImportOverlay
      onDismissOverlay={onDismiss}
      resourceName="Variable"
      onSubmit={handleImportVariable}
      status={status}
      updateStatus={updateOverlayStatus}
    />
  )
}

export default VariableImportOverlay
