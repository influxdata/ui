import React, {FC, useContext} from 'react'
import DragAndDrop from 'src/buckets/components/csvUploader/DragAndDrop'
import {ProgressBar} from '@influxdata/clockface'
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploaderProvider'

const CsvUploaderBody: FC = () => {
  const {hasFile, progress, uploadCsv} = useContext(CsvUploaderContext)

  return (
    <>
      <div>{hasFile && <ProgressBar value={progress} max={100} />}</div>
      <DragAndDrop className="line-protocol--content" onSetBody={uploadCsv} />
    </>
  )
}

export default CsvUploaderBody
