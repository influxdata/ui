// Libraries
import React, {FC, useContext} from 'react'
import {ProgressBar} from '@influxdata/clockface'

// Components
import DragAndDrop from 'src/buckets/components/csvUploader/DragAndDrop'

// Context
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploaderProvider'

// Types
import {RemoteDataState} from 'src/types'

const CsvUploaderBody: FC = () => {
  const {uploadState, progress, uploadCsv} = useContext(CsvUploaderContext)

  return (
    <>
      <div>
        {uploadState === RemoteDataState.Loading && (
          <ProgressBar value={progress} max={100} />
        )}
      </div>
      <DragAndDrop className="line-protocol--content" onSetBody={uploadCsv} />
    </>
  )
}

export default CsvUploaderBody
