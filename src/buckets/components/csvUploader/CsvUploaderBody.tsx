// Libraries
import React, {FC, useContext} from 'react'
import {ProgressBar} from '@influxdata/clockface'

// Components
import DragAndDrop from 'src/buckets/components/csvUploader/DragAndDrop'

// Context
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploader'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Types
import {RemoteDataState} from 'src/types'

type Props = {
  bucket: string
}

const CsvUploaderBody: FC<Props> = ({bucket}) => {
  const {uploadState, progress, uploadCsv} = useContext(CsvUploaderContext)

  const handleUploadCsv = (csv: string) => {
    event('Uploading_CSV')
    uploadCsv(csv, bucket)
  }

  return (
    <>
      <div>
        {uploadState === RemoteDataState.Loading && (
          <ProgressBar value={progress} max={100} />
        )}
      </div>
      <DragAndDrop
        className="line-protocol--content"
        onSetBody={handleUploadCsv}
      />
    </>
  )
}

export default CsvUploaderBody
