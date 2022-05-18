import React, {useState, FC, useRef} from 'react'

interface Props {
  filename?: string
  error?: string

  allowedExtensions: string[]

  handleFileUpload: (file?: File, contents?: string) => void
}

export const MiniFileDnd: FC<Props> = ({
  filename,
  error,

  allowedExtensions,

  handleFileUpload,
}) => {
  const [dropAreaActive, setDropAreaActive] = useState(false)

  function dragOverHandler(ev) {
    setDropAreaActive(true)

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault()
  }

  function dragLeaveHandler(ev) {
    setDropAreaActive(false)
    ev.preventDefault()
  }

  const handleFileClick = (event: any): void => {
    const file: File = event.currentTarget.files[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      handleFileUpload(file, reader.result as string)
    }
  }

  const dropHandler = (event: any): void => {
    const file = event.dataTransfer.files[0]

    if (!file) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      handleFileUpload(file, reader.result as string)
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
      accept={allowedExtensions.join(',')}
      onChange={handleFileClick}
    />
  )

  // it gets clicked programmatically since the input itself has display='none'
  const handleFileOpen = (): void => {
    inputEl.current.click()
  }

  const displayText = filename ?? 'Add schema file'

  const dropZoneClasses = [
    ['dnd', true],
    ['active', dropAreaActive],
    ['hasError', error],
  ]
    .filter(c => !!c[1])
    .map(c => `${c[0]}`)
    .join(' ')

  const displayAreaClasses = [
    ['display-area', true],
    ['active', dropAreaActive],
  ]
    .filter(c => !!c[1])
    .map(c => `${c[0]}`)
    .join(' ')

  return (
    <div className="dnd-container">
      <div
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
    </div>
  )
}
