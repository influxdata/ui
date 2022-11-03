import React, {FC, useContext, useCallback, ChangeEvent, useState} from 'react'
import {
  Button,
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Form,
  IconFont,
  Input,
  InputLabel,
  InputType,
  Overlay,
  SquareButton,
} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'
import {QueryContext} from 'src/shared/contexts/query'
import {ResultsContext} from 'src/dataExplorer/components/ResultsContext'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {RemoteDataState} from 'src/types'
import './SaveAsScript.scss'
import {CLOUD} from 'src/shared/constants'
import {OverlayType} from './FluxQueryBuilder'
import {useDispatch, useSelector} from 'react-redux'
import {notify} from 'src/shared/actions/notifications'
import {
  scriptSaveFail,
  scriptSaveSuccess,
} from 'src/shared/copy/notifications/categories/scripts'
import {getOrg, isOrgIOx} from 'src/organizations/selectors'
import OpenScript from 'src/dataExplorer/components/OpenScript'
import {DeleteScript} from 'src/dataExplorer/components/DeleteScript'
import {LanguageType} from 'src/dataExplorer/components/resources'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {SCRIPT_EDITOR_PARAMS} from 'src/dataExplorer/components/resources'
import CopyToClipboard from 'src/shared/components/CopyToClipboard'
import {
  copyToClipboardFailed,
  copyToClipboardSuccess,
} from 'src/shared/copy/notifications'
interface Props {
  language: LanguageType
  onClose: () => void
  setOverlayType: (type: OverlayType) => void
  type: OverlayType | null
}

const SaveAsScript: FC<Props> = ({language, onClose, setOverlayType, type}) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {hasChanged, resource, setResource, save} =
    useContext(PersistanceContext)
  const isIoxOrg = useSelector(isOrgIOx)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const [error, setError] = useState<string>()
  // Setting the name to state rather than persisting it to session storage
  // so that we can cancel out of a name change if needed
  const [newName, setNewName] = useState<string>(resource?.data?.name)
  const org = useSelector(getOrg)

  const handleClose = () => {
    if (!resource?.data?.id) {
      // clear out any meta data that's been set by the user prior to saving
      // if they decide to cancel out of the process and close the modal
      delete resource.data?.name
      delete resource.data?.description
      setResource({
        ...resource,
        data: {
          ...(resource?.data ?? {}),
        },
      })
    }
    onClose()
  }

  const handleUpdateDescription = (event: ChangeEvent<HTMLInputElement>) => {
    setResource({
      ...resource,
      data: {
        ...(resource?.data ?? {}),
        description: event.target.value,
      },
    })
  }

  const handleBackClick = () => {
    setOverlayType(OverlayType.EDIT)
  }

  const handleUpdateName = (event: ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value)
  }

  const clear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)

    if (isFlagEnabled('uiSqlSupport') && isIoxOrg) {
      history.replace(
        `/orgs/${org.id}/data-explorer/from/script?language=${language}&${SCRIPT_EDITOR_PARAMS}`
      )
    } else {
      history.replace(
        `/orgs/${org.id}/data-explorer/from/script${SCRIPT_EDITOR_PARAMS}`
      )
    }
    if (type !== OverlayType.OPEN) {
      onClose()
    }
  }, [onClose, setStatus, setResult, cancel, history, org?.id, type])

  const handleSaveScript = () => {
    resource.data.name = newName
    save(language)
      .then(() => {
        setError(null)
        dispatch(notify(scriptSaveSuccess(resource?.data?.name ?? '')))
        if (type !== OverlayType.OPEN) {
          onClose()
        }

        if (type === OverlayType.NEW) {
          clear()
        }
      })
      .catch(error => {
        dispatch(notify(scriptSaveFail(resource?.data?.name ?? '')))
        setError(error.message)
      })
  }

  const handleDeleteScript = () => {
    setOverlayType(OverlayType.DELETE)
  }

  const handleCopyAttempt = (
    copiedText: string,
    isSuccessful: boolean
  ): void => {
    if (isSuccessful) {
      dispatch(notify(copyToClipboardSuccess(copiedText, 'Invokable URL')))
    } else {
      dispatch(notify(copyToClipboardFailed(copiedText, 'Invokable URL')))
    }
  }

  if (type == null) {
    return null
  }

  let overlayTitle = 'Save Script'

  if (type !== OverlayType.SAVE) {
    if (resource?.data?.id && hasChanged) {
      overlayTitle = 'Do you want to save your changes first?'
    } else {
      overlayTitle = 'Do you want to save your script first?'
    }
  }
  if (type === OverlayType.EDIT) {
    overlayTitle = 'Edit Script Details'
  }

  if (type === OverlayType.DELETE) {
    return <DeleteScript onBack={handleBackClick} onClose={onClose} />
  }

  if (!hasChanged && type === OverlayType.OPEN) {
    return <OpenScript onCancel={handleClose} onClose={onClose} />
  }

  let saveText = 'Save'

  if (resource?.data?.id) {
    if (type === OverlayType.SAVE) {
      saveText = 'Update'
    } else {
      saveText = 'Yes, Update'
    }
  } else {
    if (type === OverlayType.SAVE) {
      saveText = 'Save'
    } else {
      saveText = 'Yes, Save'
    }
  }
  if (type === OverlayType.EDIT) {
    saveText = 'Update'
  }

  return (
    <Overlay.Container maxWidth={540}>
      <Overlay.Header title={overlayTitle} onDismiss={handleClose} />
      <Overlay.Body>
        <Form>
          <InputLabel>Save as</InputLabel>
          <Input
            className="save-script-name__input"
            name="name"
            required
            type={InputType.Text}
            value={newName}
            onChange={handleUpdateName}
            status={error ? ComponentStatus.Error : ComponentStatus.Default}
          />
          {error && (
            <div className="cf-form--element-error save-script--error">
              {error}
            </div>
          )}
          <InputLabel>Description</InputLabel>
          <Input
            className="script-description__input"
            name="description"
            required
            type={InputType.Text}
            value={resource?.data?.description}
            onChange={handleUpdateDescription}
          />
          {type === OverlayType.EDIT && (
            <>
              <InputLabel>Invokable URL</InputLabel>
              <CopyToClipboard
                text={`${window.location.origin}/api/v2/scripts/${resource.data.id}`}
                onCopy={handleCopyAttempt}
              >
                <div className="invokable-script__url">
                  <Input
                    type={InputType.Text}
                    value={`${window.location.origin}/api/v2/scripts/${resource.data.id}`}
                  />
                  <SquareButton
                    testID="copy-to-clipboard--script"
                    size={ComponentSize.Small}
                    color={ComponentColor.Secondary}
                    icon={IconFont.Duplicate_New}
                    shape={ButtonShape.StretchToFit}
                    titleText="Copy to clipboard"
                  />
                </div>
              </CopyToClipboard>
            </>
          )}
          {type === OverlayType.EDIT && (
            <Button
              icon={IconFont.Trash_New}
              className="edit-overlay__delete-script"
              color={ComponentColor.Danger}
              onClick={handleDeleteScript}
              text="Delete Script"
              testID="flux-query-builder--no-save"
            />
          )}
        </Form>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Tertiary}
          onClick={handleClose}
          text="Cancel"
        />
        {(type === OverlayType.NEW || type === OverlayType.OPEN) && (
          <Button
            color={ComponentColor.Default}
            onClick={clear}
            text="No, Discard"
            testID="flux-query-builder--no-save"
          />
        )}
        {CLOUD && (
          <Button
            color={ComponentColor.Primary}
            status={
              (newName?.length ?? 0) === 0
                ? ComponentStatus.Disabled
                : ComponentStatus.Default
            }
            onClick={handleSaveScript}
            text={saveText}
          />
        )}
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default SaveAsScript
