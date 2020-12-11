// Libraries
import React, {FC} from 'react'

interface Props {
  uploadContent: string
  fileName: string
}

const DragAndDropHeader: FC<Props> = ({uploadContent, fileName}) => {
  if (uploadContent) {
    return <div className="drag-and-drop--header selected">{fileName}</div>
  }

  return (
    <div className="drag-and-drop--header empty">
      Drop a file here or click to upload.
    </div>
  )
}

export default DragAndDropHeader
