import React, {FC, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import ExportOverlay from 'src/shared/components/ExportOverlay'

// Actions
import {convertToTemplate} from 'src/variables/actions/thunks'
import {clearExportTemplate} from 'src/templates/actions/thunks'
import {notify} from 'src/shared/actions/notifications'

// Types
import {AppState} from 'src/types'

import {copyToClipboardSuccess} from 'src/shared/copy/notifications'

const VariableExportOverlay: FC = () => {
  const id = useSelector((state: AppState) => state.overlays.params.id)
  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    if (id) {
      dispatch(convertToTemplate(id))
    }
  }, [id])

  const status = useSelector(
    (state: AppState) => state.resources.templates.exportTemplate.status
  )
  const template = useSelector(
    (state: AppState) => state.resources.templates.exportTemplate.item
  )

  const notes = () => {
    dispatch(
      notify(
        copyToClipboardSuccess(
          `${template.meta.name.slice(0, 30).trimRight()}...`,
          'Variable'
        )
      )
    )
  }
  const dismiss = () => {
    history.goBack()
    dispatch(clearExportTemplate)
  }

  return (
    <ExportOverlay
      resourceName="Variable"
      resource={template}
      onDismissOverlay={dismiss}
      onCopy={notes}
      status={status}
    />
  )
}

export default VariableExportOverlay
