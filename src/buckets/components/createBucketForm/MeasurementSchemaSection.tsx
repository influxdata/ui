import React, {useState, FC, useMemo} from 'react'

import {debounce, trim} from 'lodash'

import {event} from 'src/cloud/utils/reporting'

import {
  AlignItems,
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  DismissButton,
  FlexBox,
  FlexDirection,
  IconFont,
  Input,
  InputProps,
  InputType,
  Panel,
  FormElementError,
} from '@influxdata/clockface'

import 'src/buckets/components/createBucketForm/MeasurementSchema.scss'
import {
  areColumnsProper,
  isNameValid,
} from 'src/buckets/components/createBucketForm/MeasurementSchemaUtils'
import {downloadTextFile} from 'src/shared/utils/download'
import {MiniFileDnd} from 'src/buckets/components/createBucketForm/MiniFileDnd'

import {CLOUD} from 'src/shared/constants'

let MeasurementSchemaList = null,
  MeasurementSchema = null

if (CLOUD) {
  MeasurementSchema = require('src/client/generatedRoutes').MeasurementSchema
  MeasurementSchemaList = require('src/client/generatedRoutes')
    .MeasurementSchemaList
}

// note:  once you can add schemas in the create mode,
// make the second arg required
interface Props {
  measurementSchemaList?: typeof MeasurementSchemaList
  onUpdateSchemas?: (schemas: any, b?: boolean) => void
  showSchemaValidation?: boolean
}
interface PanelProps {
  measurementSchema: typeof MeasurementSchema
  index?: number
}
interface AddingProps {
  index: number
  onAddName: (name: string, isValid: boolean, index: number) => void
  onAddContents: (columns: string, filename: string, index: number) => void
  onDelete: (index: number) => void
  filename?: string
  name?: string
  showSchemaValidation?: boolean
}

const AddingPanel: FC<AddingProps> = ({
  index,
  name,
  onAddName,
  onAddContents,
  onDelete,
  filename,
  showSchemaValidation,
}) => {
  const [schemaName, setSchemaName] = useState(name)
  // innocent until proven guilty.
  // this way, when the input first shows up, it doesn't error out immediately,
  // and once the user puts something in then it gets the real value set.
  let initialValidity = {valid: true, message: null}
  if (name) {
    initialValidity = isNameValid(name)
  }
  const [schemaNameValidity, setSchemaNameValidity] = useState(initialValidity)
  const hasFileError = showSchemaValidation && !filename
  const [fileError, setFileError] = useState(hasFileError)
  let fileEMessage = null
  if (hasFileError) {
    fileEMessage = 'You must upload a file'
  }
  const [fileErrorMessage, setFileErrorMessage] = useState(fileEMessage)

  const setErrorState = (hasError, message) => {
    setFileError(hasError)

    if (!hasError) {
      message = null
    }

    setFileErrorMessage(message)
  }

  // propagating errors up (or throwing new ones),
  // since the mini file dnd component calls this method,
  // then calls setError(false).  so; if we call setError(true) then it gets immediately
  // overridden.  with the propagation, the error state only gets called once properly.
  const handleUploadFile = (contents: string, fileName: string) => {
    // keep swapping out the file, cancel out of the dialog, x out the adding line....etc

    // do parsing here;  to check in the correct format:
    let columns = null
    if (contents) {
      // parse them; if kosher; great!  if not, set errors and do not proceed
      // don't need to wrap this in try/catch since the caller of this function is inside a try/catch
      columns = JSON.parse(contents)

      if (!areColumnsProper(columns)) {
        // set errors
        throw {message: 'column file is not formatted correctly'}
      }
    }

    onAddContents(columns, fileName, index)
  }

  const dismissBtn = (
    <DismissButton
      onClick={() => onDelete(index)}
      size={ComponentSize.ExtraSmall}
      color={ComponentColor.Default}
    />
  )

  const updateName = evt => {
    const newVal = evt.target.value
    // is the name inherently valid? (does it start with an illegal char, or is too long?)
    const nameValidity = isNameValid(newVal)

    setSchemaNameValidity(nameValidity)
    setSchemaName(newVal)
    onAddName(newVal, nameValidity.valid, index)
  }

  const inputProps: InputProps = {
    placeholder: 'Give your schema a name',
    onChange: updateName,
    value: schemaName,
    className: 'schema-name-input',
    maxLength: 48,
    size: ComponentSize.Small,
    type: InputType.Text,
  }

  // doing error element and status manually; b/c
  // when using the form validation element, it only executes after the initial render,
  // and here we want it to show immediately after a 'submit' if it is invalid
  const makeNameInput = () => {
    let status = ComponentStatus.Default

    const showInvalidStatus =
      !schemaNameValidity?.valid || (showSchemaValidation && !schemaName)
    if (showInvalidStatus) {
      status = ComponentStatus.Error
    }
    inputProps.status = status

    let errorElement = null
    if (showInvalidStatus) {
      const message = schemaNameValidity?.message ?? 'You must enter a name'
      errorElement = <FormElementError message={message} />
    }

    return (
      <span>
        <Input {...inputProps} /> {errorElement}
      </span>
    )
  }
  // the first is for dnd; the second is for the file input
  const allowedTypes = ['application/json']
  const allowedExtensions = '.json'

  const newDndElement = (
    <MiniFileDnd
      key={`mini-dnd-${index}`}
      allowedExtensions={allowedExtensions}
      allowedTypes={allowedTypes}
      handleFileUpload={handleUploadFile}
      setErrorState={setErrorState}
      alreadySetFileName={filename}
    />
  )

  const errorElement = fileError ? (
    <FormElementError
      style={{wordBreak: 'break-word'}}
      message={fileErrorMessage}
    />
  ) : null

  return (
    <Panel
      className="measurement-schema-panel-container"
      key={`addMsp-${index}`}
    >
      <FlexBox
        direction={FlexDirection.Column}
        margin={ComponentSize.Large}
        alignItems={AlignItems.FlexStart}
        testID={`measurement-schema-readOnly-panel-${index}`}
        className="measurement-schema-panel"
        key={`addMsp-column-${index}`}
      >
        <div> name</div>
        <FlexBox direction={FlexDirection.Row} className="schema-row">
          {makeNameInput()}
          {newDndElement}
        </FlexBox>
        {errorElement}
        {dismissBtn}
      </FlexBox>
    </Panel>
  )
}

const EditingPanel: FC<PanelProps> = ({measurementSchema, index}) => {
  const handleDownloadSchema = () => {
    const {name} = measurementSchema
    const contents = JSON.stringify(measurementSchema.columns)
    event('bucket.download.schema.explicit')
    downloadTextFile(contents, name || 'schema', '.json')
  }

  return (
    <Panel className="measurement-schema-panel-container">
      <FlexBox
        direction={FlexDirection.Column}
        margin={ComponentSize.Large}
        alignItems={AlignItems.FlexStart}
        testID={`measurement-schema-readOnly-panel-${index}`}
        className="measurement-schema-panel"
        key={`romsp-${index}`}
      >
        <div> name</div>
        <FlexBox direction={FlexDirection.Row} className="schema-row">
          <div className="value-text">{measurementSchema.name}</div>
          <Button
            icon={IconFont.Download}
            color={ComponentColor.Secondary}
            text="Download Schema"
            onClick={handleDownloadSchema}
          />
        </FlexBox>
      </FlexBox>
    </Panel>
  )
}

export const MeasurementSchemaSection: FC<Props> = ({
  measurementSchemaList,
  onUpdateSchemas,
  showSchemaValidation,
}) => {
  const [newSchemas, setNewSchemas] = useState([])

  // this is the documentation link for explicit schemas for buckets
  const link =
    'https://docs.influxdata.com/influxdb/cloud/organizations/buckets/bucket-schema/'

  const schemas = measurementSchemaList.measurementSchemas
  let readPanels = null
  if (schemas) {
    readPanels = schemas.map((oneSchema, index) => (
      <EditingPanel
        key={`mss-ep-${index}`}
        measurementSchema={oneSchema}
        index={index}
      />
    ))
  }

  const debouncedOnUpdateSchemas = debounce(
    () => onUpdateSchemas(newSchemas, false),
    300
  )

  const setSchemasWithUpdates = schemaArray => {
    setNewSchemas(schemaArray)
    debouncedOnUpdateSchemas()
  }

  // NOT making debounced version take the flag;
  // because if the flag is true, then the new panel that just got made
  // doesn't get the flag set properly (it gets set *after* the panel is created)
  const addSchemaLine = () => {
    const newSchema = {valid: false}

    // don't need to debounce; because adding empty line without user input
    // plus if debounce the flag gets set *after* the panel is made,
    // which is not what we want.
    const newArray = [...newSchemas, newSchema]
    setNewSchemas(newArray)
    onUpdateSchemas(newArray, true)
  }

  const addSchemaButton = (
    <Button onClick={addSchemaLine} text="Add New Measurement Schema" />
  )

  const onAddName = (name, isValid, index) => {
    const lineItem = newSchemas[index]

    // using lodash trim as it is null-safe
    const trimmedName = trim(name)
    lineItem.name = trimmedName
    if (lineItem.columns && lineItem.name && isValid) {
      lineItem.valid = true
    } else {
      lineItem.valid = false
    }
    setSchemasWithUpdates(newSchemas)
  }

  // not worrying about valid columns, the handleUploadFile method that is called by the
  // upload component does the validation.

  // if this method is called, the columns are valid
  const onAddContents = (columns, filename, index) => {
    const lineItem = newSchemas[index]
    lineItem.columns = columns
    lineItem.filename = filename
    if (lineItem.columns && lineItem.name) {
      lineItem.valid = true
    }
    // not worrying about when contents has been 'un-set' since we don't allow that.
    // they could upload another file if they made a mistake (to replace it);
    // but can't change it to nothing from something
    setSchemasWithUpdates(newSchemas)
  }

  const onDelete = index => {
    newSchemas.splice(index, 1)
    // using spread operator so that the reference changes;
    // without the ref change the panels do not re-render
    setSchemasWithUpdates([...newSchemas])
  }

  const makeAddPanels = () => {
    return newSchemas.map((schema, index) => (
      <AddingPanel
        key={`${schema.name}-${index}`}
        index={index}
        onAddName={onAddName}
        onAddContents={onAddContents}
        onDelete={onDelete}
        filename={schema.filename}
        name={schema.name}
        showSchemaValidation={showSchemaValidation || false}
      />
    ))
  }

  // only re-making them when the length changes; else when they are being edited;
  // after the debounced function executes that sends the data to the parent, the text field (the name)
  // loses focus which is disorienting and wonky (it loses focus b/c the panels are re-made).
  // this fixes that by only remaking panels when one is deleted or added.
  const addPanels = useMemo(() => makeAddPanels(), [
    newSchemas.length,
    showSchemaValidation,
  ])

  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      testID="measurement-schema-section-parent"
      className="schema-section measurement"
    >
      <div className="header">
        <div className="title-text">Measurement Schema</div>
        <div className="subtext">
          Measurement Schemas provide non-conforming validation for data in the
          bucket. once a measurement schema is saved you cannot delete or modify
          existing columns. You may only add new columns.{' '}
          <a href={link} target="_blank" rel="noopener noreferrer">
            {' '}
            Learn more
          </a>
        </div>
      </div>
      {readPanels}
      {addSchemaButton}
      {addPanels}
    </FlexBox>
  )
}
