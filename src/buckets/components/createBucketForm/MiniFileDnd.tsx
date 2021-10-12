import React, {useState, FC, useRef} from 'react'

import classnames from 'classnames'

import {
  ComponentColor,
  ComponentSize,
  IconFont,
  SquareButton,
} from '@influxdata/clockface'

interface Props {
  allowedExtensions: string
  allowedTypes: string[]
  handleFileUpload: (contents: string, fileName?: string) => void
  setErrorState: (hasError: boolean, message?: string) => void
  alreadySetFileName?: string
  defaultText?: string
  preFileUpload?: () => void
  onCancel?: () => void
}

export const setGrammar = (fileTypes: string[]) => {
  const numTypes = fileTypes.length

  if (numTypes === 1) {
    return fileTypes[0]
  }

  const addOrToLastOne = () => {
    const lastOne = fileTypes.length - 1
    const lastItem = fileTypes[lastOne]
    fileTypes[lastOne] = `or ${lastItem}`
    return fileTypes
  }

  if (numTypes === 2) {
    return addOrToLastOne().join(' ')
  }

  return addOrToLastOne().join(', ')
}

/**
 *  This is a small File Drag-and-Drop Input
 *  It just has some text, with an outline.  There is no icon.
 *
 *  The user can click on it to select a file or drag and drop a file on top of it.
 *  After the file is clicked/selected or dragged (and the filetype matches the allowed types),
 *  then the filename is displayed in the display area.
 *
 *  If there is an error (if the filetype doesn't match the allowed types), then
 *  the outline turns red, and the error message is pushed up to the parent for display.
 *
 *  If a legal file is dropped, and then an illegal file is dropped, the component errors but
 *  keeps the filename and contents of the previous file.
 *
 *  This is only meant for text-based files, like .json, .csv, .xml, and such.
 *
 *  for re-rendering, can  pre-set the filename to display.
 *
 *  There can be multiple of these per page.
 *  (The existing drag and drop components, there can
 *  only be one per page, and there needs to be multiple of these per page
 *  for the parent component's needs)
 *
 *  The style changes when a file is hovering over this component,
 *  to show that it is active
 *
 *  onCancel: optional.  if this method is present, show a 'cancel' button (a red x) to the right of the dropzone
 *  when there is a file present.  When the cancel button is pressed, besides zero-ing out any local state,
 *  the method is called
 *
 * read here for drag and drop file api:
 * https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
 * https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
 * */
export const MiniFileDnd: FC<Props> = ({
  allowedExtensions,
  allowedTypes,
  handleFileUpload,
  setErrorState,
  alreadySetFileName,
  defaultText,
  preFileUpload,
  onCancel,
}) => {
  const [fileName, setFileName] = useState(alreadySetFileName)
  const [dropAreaActive, setDropAreaActive] = useState(false)
  const [hasError, setHasError] = useState(null)

  // has this component been used?
  const [isDirty, setDirty] = useState(false)

  function dragOverHandler(ev) {
    setDropAreaActive(true)

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault()
  }

  function dragLeaveHandler(ev) {
    setDropAreaActive(false)
    ev.preventDefault()
  }

  const setError = (hasError: boolean, message?: string) => {
    setHasError(hasError)

    // push error state up to the parent for better displaying
    setErrorState(hasError, message)
  }

  const processFile = file => {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      const fileName = file.name
      setDirty(true)
      if (preFileUpload) {
        preFileUpload()
      }
      try {
        handleFileUpload(reader.result as string, fileName)

        setFileName(fileName)
        setError(false)
      } catch (error) {
        setError(true, error.message)
      }
    }
  }

  const handleFileClick = (event: any): void => {
    const file: File = event.currentTarget.files[0]

    if (!file) {
      return
    }

    // don't need to see if the file type is valid; the input filters it already for us
    processFile(file)
  }

  const dropHandler = (event: any): void => {
    const file = event.dataTransfer.files[0]

    if (!file) {
      return
    }
    event.preventDefault()
    event.stopPropagation()

    const fileType = file.type

    if (allowedTypes.includes(fileType)) {
      processFile(file)
    } else {
      const niceTypes = setGrammar(allowedTypes)
      const fileTypeInfo = fileType ? ` (${fileType})` : ''

      setError(
        true,
        `Disallowed file type${fileTypeInfo}, you can only upload files with the type of ${niceTypes}.`
      )
    }

    setDropAreaActive(false)
  }

  const inputEl = useRef(null)

  const inputElement = (
    <input
      type="file"
      data-testid="drag-and-drop--input"
      ref={inputEl}
      className="drag-and-drop--input"
      accept={allowedExtensions}
      onChange={handleFileClick}
    />
  )

  // it gets clicked programmatically since the input itself has display='none'
  const handleFileOpen = (): void => {
    inputEl.current.click()
  }

  const textWithNoFile = defaultText ?? 'Add schema file'

  const displayText = fileName ?? textWithNoFile

  const dropZoneClasses = classnames('dnd', {
    active: dropAreaActive,
    hasError: hasError && !fileName,
  })

  const displayAreaClasses = classnames('display-area', {
    active: dropAreaActive,
  })

  // this is only called if onCancel is present, so don't need to check if it is there
  const doCancel = () => {
    setFileName(null)
    setHasError(false)
    setDirty(false)
    onCancel()
  }

  const cancelComponent = (
    <SquareButton
      icon={IconFont.Undo}
      onClick={doCancel}
      titleText="cancel update"
      color={ComponentColor.Secondary}
      size={ComponentSize.ExtraSmall}
    />
  )

  const cancelButton = isDirty && onCancel ? cancelComponent : null

  return (
    <div className="dnd-container">
      <div
        id="drop_zone"
        className={dropZoneClasses}
        onDrop={dropHandler}
        onDragOver={dragOverHandler}
        onDragLeave={dragLeaveHandler}
        onClick={handleFileOpen}
        data-testid="dndContainer"
      >
        <div data-testid="displayArea" className={displayAreaClasses}>
          {displayText}
        </div>
        {inputElement}
      </div>
      {cancelButton}
    </div>
  )
}
