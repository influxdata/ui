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
import {CLOUD} from 'src/shared/constants'

let MeasurementSchemaList = null,
  MeasurementSchema = null

if (CLOUD) {
  MeasurementSchema = require('src/client/generatedRoutes').MeasurementSchema
  MeasurementSchemaList = require('src/client/generatedRoutes')
    .MeasurementSchemaList
}

import {downloadTextFile} from 'src/shared/utils/download'
//todo: make import absolute (relative now)
import {MiniFileDnd} from './MiniFileDnd'

// note:  once you can add schemas in the create mode,
// make the second arg required
interface Props {
  measurementSchemaList?: typeof MeasurementSchemaList
  onUpdateSchemas?: (schemas: any) => void
  showSchemaValidation?: boolean
}
interface PanelProps {
  measurementSchema: typeof MeasurementSchema
  index?: number
}
interface AddingProps {
  index: number
  onAddName: (name: string, index: number) => void
  onAddContents: (contents: string, filename: string, index: number) => void
  onDelete: (index: number) => void
  filename?: string
  name?: string
  showSchemaValidation?: boolean
}

const areColumnsKosher = (columns) => {

    if (Array.isArray(columns){
      return true;
    }
    return false;
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
  const [fileError, setFileError] = useState(false)
  const [fileErrorMessage, setFileErrorMessage] = useState(null)

  const handleUploadFile = (contents: string, fileName: string) => {
    event('bucket.schema.explicit.uploadSchema')
    console.log('got file???', contents, fileName)

    //do parsing here?  to check in the correct format.....
    let columns = null
    if (contents) {
      // parse them; if kosher; great!  if not, set errors and do not proceed
       columns = JSON.parse(contents)
       if (!areColumnsKosher(columns)){
         //set errors
        setErrorState('columns are not kosher! oink oink')
         return;
       }
    }

    onAddContents(contents, fileName, index)
  }

  // jill note: http://localhost:9001/?path=/story/components-buttons-composed--dismissbutton
  const dismissBtn = (
    <DismissButton
      onClick={() => onDelete(index)}
      size={ComponentSize.ExtraSmall}
      color={ComponentColor.Default}
    />
  )

  const updateName = evt => {
    const newVal = evt.target.value
    console.log('updating name!', newVal)
    setSchemaName(newVal)
    onAddName(newVal, index)
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
    const needsValidation = showSchemaValidation && !schemaName
    if (needsValidation) {
      status = ComponentStatus.Error
    }
    inputProps.status = status

    let errorElement = null
    if (needsValidation) {
      errorElement = <FormElementError message={'You must enter a name'} />
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

  const setErrorState = (hasError, message) => {
    setFileError(hasError)

    if (!hasError) {
      message = null
    }

    setFileErrorMessage(message)
  }

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
      style={{'word-break': 'break-word'}}
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
    () => onUpdateSchemas(newSchemas),
    300
  )

  const setSchemasWithUpdates = schemaArray => {
    setNewSchemas(schemaArray)
    debouncedOnUpdateSchemas()
  }

  const addSchemaLine = () => {
    const newSchema = {valid: false}
    setSchemasWithUpdates([...newSchemas, newSchema])
  }

  const addSchemaButton = (
    <Button onClick={addSchemaLine} text="Add New Measurement Schema" />
  )

  const onAddName = (name, index) => {
    const lineItem = newSchemas[index]

    // using lodash trim as it is null-safe
    const trimmedName = trim(name)
    lineItem.name = trimmedName
    if (lineItem.contents && lineItem.name) {
      lineItem.valid = true
    } else {
      lineItem.valid = false
    }
    setSchemasWithUpdates(newSchemas)
  }

  const onAddContents = (columns, filename, index) => {

    // are contents kosher?
    // right now (v1): only accepting json data.  if it gets to here, it already is json
    // (json is guaranteed by the mini file dnd component)

    /**1. parse it
    //2.  check if it conforms to the MeasurementSchemaColumn interface
    //  unfortunately, have to do this manually, as typescript can't do typeof for interfaces.
    //  (but the column data type and column semantic type can be done via typeof, at least)

    //3.  if it conforms; then great!  set that column data to the lineItem.columns property and keep going through the code
          if it does not:
            a. set the mini file dnd component to error status (so it shows as with a red outline)
            b. set the error with setErrorState method in this component; and do not proceed any further with the code in this method
     */
    // let columns = null
    // if (contents) {
    //    columns = JSON.parse(contents)
    //    if (!areColumsKosher(columns)){
    //      //set errors
    //     setErrorState('columns are not kosher! oink oink')
    //      return;
    //    }
    // }
    const lineItem = newSchemas[index]
    lineItem.columns = columns
    lineItem.filename = filename
    if (lineItem.contents && lineItem.name) {
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
    console.log('making new add panels, show sv?', showSchemaValidation)
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

  //console.log('show schema validation??? jill-742am-', showSchemaValidation)
  // only re-making them when the length changes; else when they are being edited;
  // after the debounced function executes that sends the data to the parent, the text field (the name)
  // loses focus which is disorienting and wonky (it loses focus b/c the panels are re-made).
  // this fixes that by only remaking panels when one is deleted or added.
  const addPanels = useMemo(() => makeAddPanels(), [
    newSchemas.length,
    showSchemaValidation,
  ])
  //const addPanels = makeAddPanels()

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
