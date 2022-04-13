import React, {FC, useState} from 'react'
import {parse} from 'papaparse'
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
import {MiniFileDnd} from 'src/flows/pipes/QueryBuilder/MiniFileDnd'

interface ExplicitProps {
  schema: any
  onUpdate: (schema: any) => void
  onDelete: () => void
}

const ALLOWED_TYPES = ['application/json', 'text/csv']
const ALLOWED_EXTENSIONS = ['.json', '.csv']
const DATA_TYPE_STRINGS = ['integer', 'float', 'boolean', 'string', 'unsigned']

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
    return !!_schema.columns && !!_schema.name && !validSchemaName(_schema.name)
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

  const handleFileUpload = (file: File, contents: string) => {
    try {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`)
      }

      let columns
      if (file.type === 'text/csv') {
        columns = parse(contents, {header: true}).data.map(c => {
          if (!c.dataType) {
            delete c.dataType
          }
          return c
        })
      } else if (file.type === 'application/json') {
        columns = JSON.parse(contents)
      }

      if (!Array.isArray(columns)) {
        throw new Error('Column file is not formatted correctly')
      }

      columns.forEach(col => {
        if (typeof col.name !== 'string') {
          throw new Error('All columns require a name field')
        }
        if (typeof col.type !== 'string') {
          throw new Error('All columns require a type field')
        }

        if ('dataType' in col) {
          if (!DATA_TYPE_STRINGS.includes(col.dataType)) {
            throw new Error('All columns require a valid dataType')
          }
        } else if (col.type === 'field') {
          throw new Error('Invalid column: type == field')
        }
      })

      const update = {
        ...schema,
        columns: columns,
        filename: file.name,
      }

      setFileErrorMessage(null)
      onUpdate({
        ...update,
        valid: valid(update),
      })
    } catch (e) {
      setFileErrorMessage(e.message)
      onUpdate({
        ...schema,
        columns: [],
        filename: file.name,
        valid: false,
      })
    }
  }

  const nameErrorMessage = validSchemaName(schema.name)

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
              value={schema.name}
              className="schema-name-input"
              maxLength={48}
              size={ComponentSize.Small}
            />
            {!!nameErrorMessage && (
              <FormElementError message={nameErrorMessage} />
            )}
          </span>
          <MiniFileDnd
            filename={schema.filename}
            error={fileErrorMessage}
            allowedExtensions={ALLOWED_EXTENSIONS}
            handleFileUpload={handleFileUpload}
          />
        </FlexBox>
        {!!fileErrorMessage && (
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
