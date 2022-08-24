import React, {FC, useState, useContext} from 'react'

// Components
import {
  ComponentColor,
  DraggableResizer,
  FlexBox,
  FlexDirection,
  Orientation,
  Button,
  IconFont,
  Input,
  InputLabel,
  InputType,
  AlignItems,
  JustifyContent,
  Overlay,
  ComponentStatus,
} from '@influxdata/clockface'
import {QueryProvider} from 'src/shared/contexts/query'
import {EditorProvider} from 'src/shared/contexts/editor'
import {ResultsProvider} from 'src/dataExplorer/components/ResultsContext'
import {SidebarProvider} from 'src/dataExplorer/context/sidebar'
import {
  PersistanceProvider,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'
import ResultsPane from 'src/dataExplorer/components/ResultsPane'
import Sidebar from 'src/dataExplorer/components/Sidebar'
import Schema from 'src/dataExplorer/components/Schema'
import SaveAsScript from 'src/dataExplorer/components/SaveAsScript'
import {CLOUD} from 'src/shared/constants'
import * as api from 'src/client/scriptsRoutes'
import {notify} from 'src/shared/actions/notifications'
import {
  scriptSaveFail,
  scriptSaveSuccess,
} from 'src/shared/copy/notifications/categories/scripts'

// Styles
import './FluxQueryBuilder.scss'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {useDispatch} from 'react-redux'

const FluxQueryBuilder: FC = () => {
  const dispatch = useDispatch()
  const {query, vertical, setVertical} = useContext(PersistanceContext)
  const [scriptName, setScriptName] = useState(
    `Untitled Script: ${new Date().toISOString()}`
  )
  const [description, setDescription] = useState('')
  const [isPromptVisible, setIsPromptVisible] = useState(false)
  const [isSaveVisible, setIsSaveVisible] = useState(false)

  const updateScriptName = event => {
    setScriptName(event.target.value)
  }

  const updateDescription = event => {
    setDescription(event.target.value)
  }

  const handleSaveScript = async () => {
    try {
      if (api?.postScript) {
        const resp = await api.postScript({
          data: {
            name: scriptName,
            description,
            script: query,
            language: 'flux',
          },
        })

        if (resp.status !== 201) {
          throw new Error(resp.data.message)
        }

        dispatch(notify(scriptSaveSuccess(scriptName)))
      } else {
        alert('You are in an unsupported environment')
      }
    } catch (error) {
      dispatch(notify(scriptSaveFail(scriptName)))
      console.error({error})
    } finally {
      setIsSaveVisible(false)
    }
  }

  return (
    <EditorProvider>
      <SidebarProvider>
        <Overlay visible={isPromptVisible}>
          <SaveAsScript onClose={() => setIsPromptVisible(false)} />
        </Overlay>
        <Overlay visible={isSaveVisible}>
          <Overlay.Container maxWidth={500}>
            <Overlay.Header
              title="Save Script"
              onDismiss={() => setIsSaveVisible(false)}
            />
            <Overlay.Body>
              <InputLabel>Save as</InputLabel>
              <Input
                className="save-script-name__input"
                name="scriptName"
                required
                type={InputType.Text}
                value={scriptName}
                onChange={updateScriptName}
              />
              <InputLabel>Description</InputLabel>
              <Input
                name="description"
                required
                type={InputType.Text}
                value={description}
                onChange={updateDescription}
              />
            </Overlay.Body>
            <Overlay.Footer>
              <Button
                color={ComponentColor.Tertiary}
                onClick={() => setIsSaveVisible(false)}
                text="Cancel"
              />
              {CLOUD && (
                <Button
                  color={ComponentColor.Primary}
                  status={
                    scriptName.length === 0 || description.length === 0
                      ? ComponentStatus.Disabled
                      : ComponentStatus.Default
                  }
                  onClick={handleSaveScript}
                  text="Save"
                />
              )}
            </Overlay.Footer>
          </Overlay.Container>
        </Overlay>
        <FlexBox
          className="flux-query-builder--container"
          direction={FlexDirection.Column}
          justifyContent={JustifyContent.SpaceBetween}
          alignItems={AlignItems.Stretch}
        >
          <div
            className="flux-query-builder--menu"
            data-testid="flux-query-builder--menu"
          >
            <Button
              onClick={() => setIsPromptVisible(true)}
              text="New Script"
              icon={IconFont.Plus_New}
              status={
                query.length === 0
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
            />
            {isFlagEnabled('saveAsScript') && (
              <Button
                className="flux-query-builder__save-button"
                onClick={() => setIsSaveVisible(true)}
                text="Save Script"
                icon={IconFont.Save}
              />
            )}
          </div>
          <DraggableResizer
            handleOrientation={Orientation.Vertical}
            handlePositions={vertical}
            onChangePositions={setVertical}
          >
            <DraggableResizer.Panel>
              <Schema />
            </DraggableResizer.Panel>
            <DraggableResizer.Panel
              testID="flux-query-builder-middle-panel"
              className="new-data-explorer-rightside"
            >
              <ResultsPane />
            </DraggableResizer.Panel>
            <DraggableResizer.Panel>
              <Sidebar />
            </DraggableResizer.Panel>
          </DraggableResizer>
        </FlexBox>
      </SidebarProvider>
    </EditorProvider>
  )
}

export default () => (
  <QueryProvider>
    <ResultsProvider>
      <PersistanceProvider>
        <FluxQueryBuilder />
      </PersistanceProvider>
    </ResultsProvider>
  </QueryProvider>
)
