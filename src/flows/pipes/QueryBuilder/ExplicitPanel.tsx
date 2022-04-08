import React, {FC, useState} from 'react'
import {
  AlignItems,
  ComponentSize,
  ComponentColor,
  Panel,
  FormElementError,
  FlexBox,
  FlexDirection,
  Input,
  InputType,
  DismissButton,
} from '@influxdata/clockface'
import {
  DownloadTypes,
  MiniFileDnd,
} from 'src/buckets/components/createBucketForm/MiniFileDnd'
import {getColumnsFromFile} from 'src/buckets/components/createBucketForm/measurementSchemaUtils'

interface ExplicitProps {
  schema: any
  onUpdate: (schema: any) => void
  onDelete: () => void
}

const ALLOWED_TYPES = ['application/json', 'text/csv']

const ALLOWED_EXTENSIONS = ['.json', '.csv'].join(',')

const validSchemaName = (name = '') => {
  const _name = name.trim()
  if (/^[0-9_]/.test(_name)) {
    return "cannot start with '_' or a number"
  }
  if (_name.length > 128) {
    return 'too long, max length is 128 characters'
  }

  return null
}

const ExplicitPanel: FC<ExplicitProps> = ({schema, onUpdate, onDelete}) => {
  const [fileErrorMessage, setFileErrorMessage] = useState('')
  const valid = _schema => {
    return _schema.columns && _schema.name && !validSchemaName(_schema.name)
  }

  const handleNameUpdate = evt => {
    const update = {
      ...schema,
      name: evt.target.value,
    }

    onUpdate({
      ...update,
      valid: valid(update),
    })
  }

  const handleFileUpload = (
    contents: string,
    type: DownloadTypes,
    name: string
  ) => {
    let columns = []

    try {
      columns = getColumnsFromFile(contents, type)
    } catch (e) {
      onUpdate({
        schema,
        columns: [],
        filename: name,
        valid: false,
      })
    }

    const update = {
      ...schema,
      columns,
      filename: name,
    }

    onUpdate({
      ...update,
      valid: valid(update),
    })
  }

  const setErrorState = (hasError, message) => {
    if (!hasError) {
      message = null
    }

    setFileErrorMessage(message)
  }

  return (
    <Panel className="measurement-schema-panel-container">
      <FlexBox
        direction={FlexDirection.Column}
        margin={ComponentSize.Large}
        alignItems={AlignItems.FlexStart}
        testID={`measurement-schema-readOnly-panel`}
        className="measurement-schema-panel"
      >
        <div className="value-text">name</div>
        <FlexBox direction={FlexDirection.Row} className="schema-row">
          <span>
            <Input
              type={InputType.Text}
              placeholder="Give your schema a name"
              onChange={handleNameUpdate}
              value={name}
              className="schema-name-input"
              maxLength={48}
              size={ComponentSize.Small}
            />
          </span>
          <MiniFileDnd
            allowedExtensions={ALLOWED_EXTENSIONS}
            allowedTypes={ALLOWED_TYPES}
            handleFileUpload={handleFileUpload}
            setErrorState={setErrorState}
            alreadySetFileName={schema.filename}
          />
        </FlexBox>
        {fileErrorMessage && (
          <FormElementError
            style={{wordBreak: 'break-word'}}
            message={fileErrorMessage}
          />
        )}
        <DismissButton
          onClick={() => onDelete()}
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Default}
        />
      </FlexBox>
    </Panel>
  )
}

export default ExplicitPanel
