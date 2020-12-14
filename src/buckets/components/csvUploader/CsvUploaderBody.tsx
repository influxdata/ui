// Libraries
import React, {FC, useContext} from 'react'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {ProgressBar} from '@influxdata/clockface'

// Components
import DragAndDrop from 'src/buckets/components/csvUploader/DragAndDrop'

// Context
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploaderProvider'

// Utils
import {getByID} from 'src/resources/selectors'

// Types
import {AppState, Bucket, RemoteDataState, ResourceType} from 'src/types'

const CsvUploaderBody: FC = () => {
  const {uploadState, progress, uploadCsv} = useContext(CsvUploaderContext)

  const {bucketID} = useParams()
  const bucket =
    useSelector((state: AppState) =>
      getByID<Bucket>(state, ResourceType.Buckets, bucketID)
    )?.name ?? ''

  const handleUploadCsv = (csv: string) => {
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
