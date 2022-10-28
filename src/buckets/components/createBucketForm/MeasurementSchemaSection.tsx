import React, {FC, useMemo, useState} from 'react'

import {trim} from 'lodash'

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
  FormElementError,
  IconFont,
  Input,
  InputLabel,
  InputProps,
  InputToggleType,
  InputType,
  Panel,
  Toggle,
} from '@influxdata/clockface'

import 'src/buckets/components/createBucketForm/MeasurementSchema.scss'
import {
  isNameValid,
  getColumnsFromFile,
  toCsvString,
} from 'src/buckets/components/createBucketForm/measurementSchemaUtils'

import {downloadTextFile} from 'src/shared/utils/download'
import {
  DownloadTypes,
  MiniFileDnd,
} from 'src/buckets/components/createBucketForm/MiniFileDnd'

import {CLOUD} from 'src/shared/constants'
import classnames from 'classnames'

let MeasurementSchemaList = null,
  MeasurementSchema = null,
  MeasurementSchemaColumn = null

if (CLOUD) {
  MeasurementSchema = require('src/client/generatedRoutes').MeasurementSchema
  MeasurementSchemaList =
    require('src/client/generatedRoutes').MeasurementSchemaList
  MeasurementSchemaColumn =
    require('src/client/generatedRoutes').MeasurementSchemaColumn
}

/**
 * Errors:
 *
 * don't show any 'empty' errors first (empty fields); want to give the user a chance to enter data
 * if the fields are empty and the user presses submit, and there is missing data, then the form will not be valid, the submit
 * will not go through, and showSchemaValidation will be set to true
 *
 * for adding panel:
 * if schemaValidation is on:  will show lack of name or file if one of them is entered
 *      if neither is entered, then no-op, as if that panel isn't there
 *
 *      the name is validated too (must not start with a _ or a number)
 *
 *  for both editing & adding panel:
 *           Mini File Dnd Component:
 *                  catches errors in handleFileUpload
 *                             it turns component to error state, and styles are applied
 *                             passes error state and message up to parent (the panel)
 *                                for display
 * */

interface Props {
  measurementSchemaList?: typeof MeasurementSchemaList
  onUpdateSchemas?: (schemas: SchemaUpdateInfo[]) => void
  onAddSchemas: (schemas: typeof MeasurementSchema, b?: boolean) => void
  showSchemaValidation: boolean
}

/**
 * toggleUpdate:  is this line being updated?
 * need to have this passed up, because the erroring on the
 * file dnd element  is triggered separately from onAddUpdate(either
 * onAddUpdate is triggered, or an error is sent; not both)
 *
 * when creating a new schema, an object is created with a false valid value,
 * and then as things are added it the value gets turned to true
 *
 * since we already have something showing, need to know when it needs
 * validation
 *
 * and we can also cancel out of updating.
 *
 * so:  if toggleUpdate is set to true, then that measurement schema is getting
 * an update, and the validation is set to false, and if there is a valid columns
 * file then it gets set to true.
 *
 * if toggleUpdate gets set to false, then no validation is needed
 * as nothing is being updated on that measurement schema
 * (that happens when the user cancels out of the update)
 *
 * measurementSchema:  the measurement schema that is being displayed in this editing panel
 * index: used by the parent for updates and key generation
 *
 * onAddUpdate: called when the measurement schema in this panel is being updated, tells the parent the new
 * column information
 * */
interface PanelProps {
  measurementSchema: typeof MeasurementSchema
  index: number
  onAddUpdate: (columns: string, index: number) => void
  toggleUpdate: (doingUpdate: boolean, index: number) => void
  downloadFormat?: DownloadTypes
}
/**
 * onAddName: called when the name of the schema has been added
 * onAddContents: called when the contents (the columns) have been added
 * filename:  used for re-drawing the panel after a deletion of another panel
 * name: used for re-drawing the panel after a deletion of another panel
 * showSchemaValidation: false initially, if true: show validation errors;
 *  do not want to show them when the user initially adds data; since one of the errors is missing data.
 *  want to give them a chance to enter new data; this is turned on to true after the user presses 'submit' on the form
 */
interface AddingProps {
  index: number
  onAddName: (name: string, isValid: boolean, index: number) => void
  onAddContents: (columns: string, filename: string, index: number) => void
  onDelete: (index: number) => void
  filename?: string
  name?: string
  showSchemaValidation?: boolean
}

// the first is for dnd; the second is for the file input
const allowedTypes = ['application/json', 'text/csv']
const allowedExtensions = '.json,.csv'

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
  const fileErrorInit = showSchemaValidation && !filename
  const [hasFileError, setHasFileError] = useState(fileErrorInit)
  let fileEMessage = null
  if (fileErrorInit) {
    fileEMessage = 'You must upload a file'
  }
  const [fileErrorMessage, setFileErrorMessage] = useState<string>(fileEMessage)

  const setErrorState = (hasError, message) => {
    setHasFileError(hasError)

    if (!hasError) {
      message = null
    }

    setFileErrorMessage(message)
  }

  // propagating errors up (or throwing new ones),
  // since the mini file dnd component calls this method,
  // then calls setError(false).  so; if we call setError(true) then it gets immediately
  // overridden.  with the propagation, the error state only gets called once properly.
  const handleFileUpload = (
    contents: string,
    fileType: DownloadTypes,
    fileName: string
  ) => {
    // keep swapping out the file, cancel out of the dialog, x out the adding line....etc

    const columns = getColumnsFromFile(contents, fileType)
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

  const newDndElement = (
    <MiniFileDnd
      key={`mini-dnd-${index}`}
      allowedExtensions={allowedExtensions}
      allowedTypes={allowedTypes}
      handleFileUpload={handleFileUpload}
      setErrorState={setErrorState}
      alreadySetFileName={filename}
    />
  )

  const errorElement = hasFileError ? (
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
        <div className="value-text"> name</div>
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

const EditingPanel: FC<PanelProps> = ({
  index,
  measurementSchema,
  onAddUpdate,
  toggleUpdate,
  downloadFormat = 'json',
}) => {
  const [fileErrorMessage, setFileErrorMessage] = useState(null)
  const [fileError, setFileError] = useState(false)
  const [isUpdateInProgress, setUpdateInProgress] = useState(false)

  const setUserWantsUpdate = () => {
    toggleUpdate(true, index)
    setUpdateInProgress(true)
  }

  const cancelUpdate = () => {
    toggleUpdate(false, index)
    setFileError(false)
    setFileErrorMessage(null)
    setUpdateInProgress(false)
  }

  const handleDownloadSchema = () => {
    const {name} = measurementSchema
    let contents = JSON.stringify(measurementSchema.columns)
    let extension = '.json'
    // if csv selected, do csv conversion instead
    if (downloadFormat === 'csv') {
      contents = toCsvString(measurementSchema.columns)
      extension = '.csv'
    }
    event('bucket.download.schema.explicit')
    downloadTextFile(contents, name || 'schema', extension)
  }

  const handleFileUpload = (contents: string, fileType: DownloadTypes) => {
    const columns = getColumnsFromFile(contents, fileType)
    onAddUpdate(columns, index)
  }

  const setErrorState = (hasError, message) => {
    setFileError(hasError)

    if (!hasError) {
      message = null
    }

    setFileErrorMessage(message)
  }

  const errorElement = fileError ? (
    <FormElementError
      style={{wordBreak: 'break-word'}}
      message={fileErrorMessage}
    />
  ) : null

  const schemaRowClasses = classnames('schema-row', {
    hasCancelBtn: isUpdateInProgress,
  })

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
        <div
          data-testid={`measurement-schema-name-${index}`}
          className="value-text"
        >
          {measurementSchema.name}
        </div>
        <FlexBox direction={FlexDirection.Row} className={schemaRowClasses}>
          <Button
            icon={IconFont.Download_New}
            color={ComponentColor.Secondary}
            text="Download Schema"
            onClick={handleDownloadSchema}
            testID="measurement-schema-download-button"
            className="download-button"
          />
          <MiniFileDnd
            key={`update-mini-dnd-${index}`}
            allowedExtensions={allowedExtensions}
            allowedTypes={allowedTypes}
            handleFileUpload={handleFileUpload}
            setErrorState={setErrorState}
            defaultText="Update schema file"
            preFileUpload={setUserWantsUpdate}
            onCancel={cancelUpdate}
          />
        </FlexBox>
        {errorElement}
      </FlexBox>
    </Panel>
  )
}

export interface SchemaUpdateInfo {
  currentSchema: typeof MeasurementSchema
  hasUpdate: boolean
  isValid?: boolean
  columns?: typeof MeasurementSchemaColumn[]
}

export const MeasurementSchemaSection: FC<Props> = ({
  measurementSchemaList,
  onUpdateSchemas,
  onAddSchemas,
  showSchemaValidation,
}) => {
  const [newSchemas, setNewSchemas] = useState([])

  // each object:  currentSchema: MeasurementSchema, hasUpdate:boolean, isValid:boolean, columns: MeasurementSchemaColumn[]
  const updateInit =
    measurementSchemaList?.measurementSchemas?.map(schema => ({
      currentSchema: schema,
      hasUpdate: false,
    })) || []
  const [schemaUpdates, setSchemaUpdates] = useState(updateInit)
  const [downloadType, setDownloadType] = useState<DownloadTypes>('json')

  // every time we update the local schema, should also send up the schema to the parent
  // so putting them together here
  const doSchemaUpdate = (schemaUpdates: SchemaUpdateInfo[]) => {
    onUpdateSchemas(schemaUpdates)
    setSchemaUpdates(schemaUpdates)
  }

  const onAddUpdate = (columns, index) => {
    const entry = schemaUpdates[index] || {}
    entry.columns = columns
    entry.hasUpdate = true
    entry.valid = true

    schemaUpdates[index] = entry
    doSchemaUpdate(schemaUpdates)
  }

  const toggleUpdate = (doingUpdate, index) => {
    const entry = schemaUpdates[index] || {}

    if (doingUpdate) {
      entry.hasUpdate = true
      entry.valid = false
    } else {
      // cancelling
      entry.hasUpdate = false
    }

    schemaUpdates[index] = entry
    doSchemaUpdate(schemaUpdates)
  }

  // this is the documentation link for explicit schemas for buckets
  const link =
    'https://docs.influxdata.com/influxdb/cloud/organizations/buckets/bucket-schema/'

  const schemas = measurementSchemaList?.measurementSchemas
  let readSection = null
  if (schemas) {
    /**
     * typescript transpiler needs this; using just setDownloadType
     * yields an error (claims the argument is of type string)
     * */
    const onDownloadTypeChange = (dtype: DownloadTypes) => {
      setDownloadType(dtype)
    }

    const readPanels = schemas.map((oneSchema, index) => (
      <EditingPanel
        key={`mss-ep-${index}`}
        measurementSchema={oneSchema}
        index={index}
        onAddUpdate={onAddUpdate}
        toggleUpdate={toggleUpdate}
        downloadFormat={downloadType}
      />
    ))

    const labelStyle = {marginRight: 10}
    const downloadToggle = (
      <FlexBox direction={FlexDirection.Row}>
        <InputLabel style={labelStyle}> Download File Format: </InputLabel>
        <Toggle
          tabIndex={1}
          value="json"
          id="json-download-flavor-choice"
          name="json-download-flavor-choice"
          className="option"
          checked={downloadType === 'json'}
          onChange={onDownloadTypeChange}
          type={InputToggleType.Radio}
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Primary}
          testID="json-download-flavor-choice"
        >
          <InputLabel
            htmlFor="json-download-flavor-choice"
            active={downloadType === 'json'}
          >
            json
          </InputLabel>
        </Toggle>
        <Toggle
          tabIndex={2}
          value="csv"
          id="csv-download-flavor-choice"
          name="csv-download-flavor-choice"
          className="option"
          checked={downloadType === 'csv'}
          onChange={onDownloadTypeChange}
          type={InputToggleType.Radio}
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Primary}
          testID="csv-download-flavor-choice"
        >
          <InputLabel
            htmlFor="csv-download-flavor-choice"
            active={downloadType === 'csv'}
          >
            csv
          </InputLabel>
        </Toggle>
      </FlexBox>
    )
    readSection = (
      <>
        {downloadToggle} {readPanels}{' '}
      </>
    )
  }

  const setNewSchemasWithUpdates = schemaArray => {
    setNewSchemas(schemaArray)
    onAddSchemas(schemaArray, false)
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
    onAddSchemas(newArray, true)
  }

  const addSchemaButton = (
    <Button
      onClick={addSchemaLine}
      testID="measurement-schema-add-file-button"
      text="Add New Measurement Schema"
    />
  )

  const onAddName = (name = '', isValid, index) => {
    const lineItem = newSchemas[index]

    // using lodash trim as it is null-safe
    const trimmedName = trim(name)

    lineItem.name = trimmedName
    if (lineItem.columns && lineItem.name && isValid) {
      lineItem.valid = true
    } else {
      lineItem.valid = false
    }
    // save the name validity, so when columns are added don't need to run it again:
    lineItem.validName = isValid

    setNewSchemasWithUpdates(newSchemas)
  }

  // not worrying about valid columns, the handleUploadFile method that is called by the
  // upload component does the validation.

  // if this method is called, the columns are valid
  const onAddContents = (columns, filename, index) => {
    const lineItem = newSchemas[index]
    lineItem.columns = columns
    lineItem.filename = filename

    if (lineItem.columns && lineItem.name && lineItem.validName) {
      lineItem.valid = true
    }
    // not worrying about when contents has been 'un-set' since we don't allow that.
    // they could upload another file if they made a mistake (to replace it);
    // but can't change it to nothing from something
    setNewSchemasWithUpdates(newSchemas)
  }

  const onDelete = index => {
    newSchemas.splice(index, 1)
    // using spread operator so that the reference changes;
    // without the ref change the panels do not re-render
    setNewSchemasWithUpdates([...newSchemas])
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
  // only re-making them when one is added or removed removes the need for debouncing the update
  // (it was debounced to prevent re-renderings with each keystroke when the name was being entered)
  const addPanels = useMemo(
    () => makeAddPanels(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newSchemas.length, showSchemaValidation]
  )

  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      testID="measurement-schema-section-parent"
      className="measurement-section measurement"
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
      {readSection}
      {addSchemaButton}
      {addPanels}
    </FlexBox>
  )
}
