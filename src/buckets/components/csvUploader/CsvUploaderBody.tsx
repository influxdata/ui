// Libraries
import React, {FC} from 'react'

// Components
import DragAndDrop from 'src/buckets/components/csvUploader/DragAndDrop'

// Context
// import {CsvUploaderContext} from 'src/buckets/components/context/csvUploader'

// Utils
import {event} from 'src/cloud/utils/reporting'

type Props = {
  bucket: string
  uploadCsv: (csv: string, bucket: any) => void
}

const CsvUploaderBody: FC<Props> = ({bucket, uploadCsv}) => {
  // const {uploadCsv} = useContext(CsvUploaderContext)

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
