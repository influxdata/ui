// Libraries
import React, {FC, useContext} from 'react'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {ProgressBar} from '@influxdata/clockface'

// Components
import DragAndDrop from 'src/buckets/components/csvUploader/DragAndDrop'

// Context
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploader'

// Utils
import {getByID} from 'src/resources/selectors'
import {event} from 'src/cloud/utils/reporting'

// Types
import {AppState, Bucket, RemoteDataState, ResourceType} from 'src/types'

type Props = {
  bucket?: string
}

const CsvUploaderBody: FC<Props> = ({bucket}) => {
  const {uploadState, progress, uploadCsv} = useContext(CsvUploaderContext)

  const {bucketID} = useParams()
  const selectedBucket =
    useSelector((state: AppState) =>
      getByID<Bucket>(state, ResourceType.Buckets, bucketID)
    )?.name ?? ''

  const handleUploadCsv = (csv: string) => {
    event('Uploading_CSV')
    uploadCsv(csv, bucket ?? selectedBucket)
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
