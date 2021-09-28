import React, {useState, FC, useRef} from 'react'

import classnames from 'classnames'

interface Props {
  allowedExtensions: string
  allowedTypes: string[]
  handleFileUpload: (contents: string, fileName: string) => void
  setErrorState: (hasError: boolean, message?: string) => void
  alreadySetFileName?: string
}

export const setGrammar = (fileTypes: string[]) => {
  const numTypes = fileTypes.length

  if (numTypes === 1) {
    return fileTypes[0]
  }

  const addOrToLastOne = fileTypes.map((ft, index) => {
    if (index === numTypes - 1) {
      return `or ${ft}`
    } else {
      return ft
    }
  })

  if (numTypes === 2) {
    return addOrToLastOne.join(' ')
  }

  return addOrToLastOne.join(', ')
}

/**
 *  This is a small File Drag-and-Drop Input
 *  It just has some text, with an outline.  there is no icon.
 *
 *  The user can click on it to select a file or drag and drop a file on top of it.
 *
 *  There can be multiple of these per page.
 *
 *  The style changes when a file is hovering over this component,
 *  to show that it is active
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
}) => {
  const [fileName, setFileName] = useState(alreadySetFileName)
  const [dropAreaActive, setDropAreaActive] = useState(false)
  const [hasError, setHasError] = useState(null)

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
      handleFileUpload(reader.result as string, fileName)

      setFileName(fileName)
      setError(false)
    }
  }

  const handleFileClick = (e: any): void => {
    const file: File = e.currentTarget.files[0]

    if (!file) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    // don't need to see if the file type is valid; the input filters it already for us
    processFile(file)
  }

  const dropHandler = (e: any): void => {
    const file = e.dataTransfer.files[0]
    const fileType = file.type

    if (!file) {
      return
    }
    e.preventDefault()
    e.stopPropagation()

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

  const displayText = fileName ?? 'Add schema file'

  const dropZoneClasses = classnames('dnd', {
    active: dropAreaActive,
    hasError: hasError && !fileName,
  })

  const displayAreaClasses = classnames('display-area', {
    active: dropAreaActive,
  })

  return (
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
  )
}
