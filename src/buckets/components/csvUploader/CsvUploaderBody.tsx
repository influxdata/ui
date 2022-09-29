// Libraries
import React, {FC} from 'react'

// Components
import DragAndDrop from 'src/buckets/components/csvUploader/DragAndDrop'

// Utils
import {event} from 'src/cloud/utils/reporting'

type Props = {
  bucket: string
  uploadCsv: (csv: string, bucket: string) => void
}

const CsvUploaderBody: FC<Props> = ({bucket, uploadCsv}) => {
  const handleUploadCsv = (csv: string) => {
    event('Uploading_CSV')
    uploadCsv(csv, bucket)
  }

  return (
    <DragAndDrop
      className="line-protocol--content"
      onSetBody={handleUploadCsv}
    />
  )
}

export default CsvUploaderBody
