// Libraries
import React, {FC, useContext} from 'react'

// Components
import {
  Grid,
  Columns,
  Dropdown,
  Form,
  List,
  Panel,
  ComponentSize,
} from '@influxdata/clockface'

// Types
import {AnnotationStream} from 'src/annotations/constants/mocks'

// Mock Data
import {MOCK_ANNOTATION_STREAMS} from 'src/annotations/constants/mocks'

// Actions
import {updateAnnotationDraft} from 'src/annotations/actions/annotationFormActions'

// Contexts
import {AnnotationFormContext} from 'src/annotations/components/annotationForm/AnnotationForm'

// Styles
import 'src/annotations/components/annotationForm/AnnotationStreamSelector.scss'

export const AnnotationStreamSelector: FC = () => {
  const {streamID, streamIDError, dispatch} = useContext(AnnotationFormContext)

  const handleChange = (stream: AnnotationStream): void => {
    dispatch(updateAnnotationDraft({streamID: stream.id, ...stream}))
  }

  // Normally get this from redux with useSelector + ResourceType.AnnotationStream
  const streams = MOCK_ANNOTATION_STREAMS
  const selectedStream = streams.find(stream => stream.id === streamID)
  const buttonText = selectedStream ? selectedStream.name : 'Choose a stream'

  let tagsList

  if (selectedStream && selectedStream.query) {
    const tagKeys = Object.keys(selectedStream.query.tags)
    tagsList = (
      <div className="annotation-stream-selector--tag-list">
        <div className="annotation-stream-selector--tag">
          {`measurement = ${selectedStream.query.measurement}`}
        </div>
        {tagKeys.map(tagKey => {
          return (
            <div
              key={tagKey}
              className="annotation-stream-selector--tag"
            >{`${tagKey} = ${selectedStream.query.tags[tagKey]}`}</div>
          )
        })}
      </div>
    )
  }

  return (
    <Grid.Column widthXS={Columns.Twelve}>
      <Form.Element label="Stream" required={true} errorMessage={streamIDError}>
        <Panel>
          <Panel.Body size={ComponentSize.Small}>
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button active={active} onClick={onClick}>
                  {buttonText}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  <List style={{width: '100%'}}>
                    {streams.map(stream => (
                      <List.Item
                        key={stream.id}
                        value={stream}
                        selected={stream.id === streamID}
                        onClick={handleChange}
                      >
                        <List.Indicator type="dot" />
                        {stream.name}
                      </List.Item>
                    ))}
                  </List>
                </Dropdown.Menu>
              )}
            />
            <p className="annotation-stream-selector--heading">
              This annotation will inherit the following tags:
            </p>
            {tagsList}
          </Panel.Body>
        </Panel>
      </Form.Element>
    </Grid.Column>
  )
}
